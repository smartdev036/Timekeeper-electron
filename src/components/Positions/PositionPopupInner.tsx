import { Fragment, useState } from "react";
import DB, { ElectronAlert, ElectronConfirm } from "../../DB";
import { LogTimes, Positions } from "../../db-typings/electron/Models";
import Button from "../../inputs/Button";
import Container from "../../reusable/components/Container";
import useReRender from "../../reusable/hooks/useReRender";
import LocalDate from "../../reusable/LocalDate";
import LocalTime from "../../reusable/LocalTime";
import AsyncErrorCatcher from "../../reusable/utils/AsyncErrorCatcher";
import CombinePopup from "./CombinePopup";
import ControllerInput from "./ControllerInput";
import styles from "./PositionPopupInner.module.scss";
import StateTimePicker from "./TimePicker";

interface OptionType {
  label: string;
  id: number;
}

interface PositionPopupInnerProps {
  date: LocalDate;
  position: Positions;
  combined?: string;
  status?: LogTimes & {
    controller_initials: string;
    trainee_initials: string;
  };
  closePopup: () => void;
}

const PositionPopupInner = ({
  position,
  closePopup,
  date,
  status,
  ...props
}: PositionPopupInnerProps) => {
  const isDateToday = date.toSerialized() === new LocalDate().toSerialized();
  // if (!isDateToday) {
  //     initalTime.setHours(23, 59, 59)
  // }

  const State = {
    time: useState<LocalTime | null>(new LocalTime()),
    controller: useState<OptionType | null>(null),
    trainee: useState<OptionType | null>(null),
  };

  const TimeErrorState = useState<string | null>(null);

  const { ReRender } = useReRender();
  const ConfirmFutureTime = async (
    type: "closing" | "adding",
    time: LocalTime
  ): Promise<boolean> => {
    if (time.toSerialized() > (status?.start_time ?? 0)) {
      return true;
    }
    const message =
      "You're adding a log before the current one. Are you sure you want to add this log?";
    return ElectronConfirm(message);
  };

  const WrapPositionAdding = (func: () => Promise<void | NodeJS.Timeout>) => {
    return AsyncErrorCatcher(async () => {
      try {
        return await func();
      } catch (error) {
        console.log(error);

        if (
          (error as Error).message.includes(
            "UNIQUE constraint failed: log_times.position_id, log_times.log_date, log_times.start_time"
          )
        ) {
          return setTimeout(() =>
            ElectronAlert("Log already exists for the position at this time.")
          );
        }
        throw error;
      }
    });
  };

  const HandleAdd = WrapPositionAdding(async () => {

    if (State.time[0] === null) return;
    if (State.controller[0] === null) return;
    if (TimeErrorState[0])
      return setTimeout(() => ElectronAlert("Enter a valid time."));
    if (!(await ConfirmFutureTime("adding", State.time[0]))) return;

    if (status?.controller_id != State.controller[0].id) {
      if (State?.trainee[0]?.id != status?.controller_id) {
        // If not exist, so new one        
        try {
          await DB.Bullpen.Add(Number(status?.controller_id))
        } catch (e) {
          console.log("error: ", e)
        }
        // await DB.Bullpen.UpdateTimeSinceInActive(
        //   Number(status?.controller_id),
        //   new Date().getTime().toString()
        // );
      }
      if (status?.trainee_controller_id != State?.controller[0].id) {
        try {
          DB.Bullpen.Delete(Number(State.controller[0].id))
        } catch (e) {
          console.log("error2: ", e)
        }
      }
      //   DB.Bullpen.UpdateTimeSinceInActive(State.controller[0].id, "0");
    }

    if (status?.trainee_controller_id != State.controller[0].id && status?.trainee_controller_id != State?.trainee[0]?.id) {
      try {
        await DB.Bullpen.Add(Number(status?.trainee_controller_id))
      } catch (e) {
        console.log("error3: ", e)
      }
      // await DB.Bullpen.UpdateTimeSinceInActive(
      //   Number(status?.trainee_controller_id),
      //   new Date().getTime().toString()
      // );
    }

    if (State?.trainee[0]?.id) {
      if (status?.controller_id != State?.trainee[0]?.id && status?.trainee_controller_id != State?.trainee[0]?.id) {
        try {
          await DB.Bullpen.Delete(Number(State?.trainee[0]?.id))
        } catch (e) {
          console.log("error4: ", e)
        }
      }
    }
    // DB.Bullpen.UpdateTimeSinceInActive(Number(State?.trainee[0]?.id), "0");

    await DB.PositionCombinations.insert_tbl_pos(position.id , position.id, date.toSerialized())
    await HandleDecombine()

    await DB.LogTimes.Add({
      position_id: position.id,
      controller_id: State.controller[0].id,
      trainee_controller_id: State.trainee[0]?.id ?? 0,
      log_date: date.toSerialized(),
      start_time: State.time[0].toSerialized(),
    });

    closePopup();
    ReRender();
  });

  const HandleClose = WrapPositionAdding(async () => {

    if (State.time[0] === null) {
      return setTimeout(() => ElectronAlert("Set close time."));
    }
    if (TimeErrorState[0])
      return setTimeout(() => ElectronAlert("Enter a valid time."));
    if (!(await ConfirmFutureTime("closing", State.time[0]))) return;

    // Add bulletin when removed from active position
    if (status?.trainee_controller_id) {
      try {
        await DB.Bullpen.Add(Number(status?.trainee_controller_id))
        await DB.Bullpen.UpdateTimeSinceInActive(
          Number(status?.trainee_controller_id), new Date().getTime().toString()
        );
      } catch (e) {
        console.log('Popup Iner: ', e)
      }
    }
    if (status?.controller_id) {
      try {
        await DB.Bullpen.Add(Number(status?.controller_id))
        await DB.Bullpen.UpdateTimeSinceInActive(
          Number(status?.controller_id), new Date().getTime().toString()
        );
      } catch (e) {
        console.log('popup error: ', e)
      }
    }

    await DB.PositionCombinations.insert_tbl_pos(position.id , position.id, date.toSerialized())
    await HandleDecombine()

    await DB.LogTimes.Close({
      position_id: position.id,
      log_date: date.toSerialized(),
      start_time: State.time[0].toSerialized(),
    });
    closePopup();
    ReRender();
  });

  const HandleDecombine = async() => {
    if(props.combined){
      await DB.PositionCombinations.Decombine(position.id, date.toSerialized());
    }
  };

  return (
    <Container className={styles.PopupInner} noMargin={true}>
      <Container noMargin={true} className={styles.PopupHeading}>
        <div className={styles.OverflowWrapper}>{position.name}</div>
        <div className={styles.OverflowWrapper}>{position.shorthand}</div>
        {
          props.combined && (
            <div className={styles.CombinedMessage}>
              {'( Combined with '}<strong>{props.combined}</strong>{')'}
            </div>
          )
        }
      </Container>
      <Fragment>
        <Container className={styles.PopupInputs} width="70%">
          <StateTimePicker
            required
            label="Time"
            state={State.time}
            shouldDisableFuture={isDateToday}
            setError={TimeErrorState[1]}
          />
          <ControllerInput
            label="Controller"
            state={State.controller}
            required
            include={!props.combined ? [
              status?.controller_id ?? 0,
              status?.trainee_controller_id ?? 0,
            ] : []}
            exclude={[State.trainee[0]?.id ?? 0]}
            until={{
              date: date.toSerialized(),
            }}
          />
          <ControllerInput
            label="Trainee (Optional)"
            state={State.trainee}
            include={!props.combined ? [
              status?.controller_id ?? 0,
              status?.trainee_controller_id ?? 0,
            ] : []}
            exclude={[State.controller[0]?.id ?? 0]}
            until={{
              date: date.toSerialized(),
            }}
          />
        </Container>
        <Container className={styles.PopupButtons}>
          <Button label="Accept" onClick={HandleAdd} />
          <Container dir="row">
            <CombinePopup
              position={position}
              closePopup={closePopup}
              date={date}
              trainee_controller_id={status?.trainee_controller_id}
              controller_id={status?.controller_id}
              start_time={State.time[0]?.toSerialized() ?? new LocalTime().toSerialized()} 
            />
            <Button label="Closed" width="100%" onClick={HandleClose} />
          </Container>
        </Container>
      </Fragment>
    </Container>
  );
};

export default PositionPopupInner;
