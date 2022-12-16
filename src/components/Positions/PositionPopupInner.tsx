import { Fragment, useState } from "react";
import DB from "../../DB";
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
    return window.confirm(message);
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
            alert("Log already exists for the position at this time.")
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
      return setTimeout(() => alert("Enter a valid time."));
    if (!(await ConfirmFutureTime("adding", State.time[0]))) return;

    if (status?.controller_id != State.controller[0].id) {
      if (State?.trainee[0]?.id != status?.controller_id) {
        DB.Bullpen.UpdateTimeSinceInActive(
          Number(status?.controller_id),
          new Date().getTime().toString()
        );
      }
      if(State.controller[0].id){
        DB.Bullpen.UpdateTimeSinceInActive(State.controller[0].id, "0");
      }
    }
 
    if (State?.trainee[0]?.id) {
      if (status?.trainee_controller_id != State.controller[0].id && status?.trainee_controller_id != State?.trainee[0]?.id) {
        DB.Bullpen.UpdateTimeSinceInActive(
          Number(status?.trainee_controller_id),
          new Date().getTime().toString()
        );
      }
      DB.Bullpen.UpdateTimeSinceInActive(Number(State?.trainee[0]?.id), "0");
    }

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
      return setTimeout(() => alert("Set close time."));
    }
    if (TimeErrorState[0])
      return setTimeout(() => alert("Enter a valid time."));
    if (!(await ConfirmFutureTime("closing", State.time[0]))) return;
    DB.Bullpen.UpdateTimeSinceInActive(
      Number(status?.trainee_controller_id),
      new Date().getTime().toString()
    );
    DB.Bullpen.UpdateTimeSinceInActive(
      Number(status?.controller_id),
      new Date().getTime().toString()
    );
    await DB.LogTimes.Close({
      position_id: position.id,
      log_date: date.toSerialized(),
      start_time: State.time[0].toSerialized(),
    });
    closePopup();
    ReRender();
  });

  const HandleDecombine = () => {
    DB.PositionCombinations.Decombine(position.id, date.toSerialized());
    ReRender();
  };

  return (
    <Container className={styles.PopupInner} noMargin={true}>
      <Container noMargin={true} className={styles.PopupHeading}>
        <div>{position.name}</div>
        <div>({position.shorthand})</div>
      </Container>
      {props.combined ? (
        <Container className={styles.CombinedMessage}>
          <div>
            Combined with <strong>{props.combined}</strong>
          </div>
          <Button label="Decombine" onClick={HandleDecombine} />
        </Container>
      ) : (
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
              include={[
                status?.controller_id ?? 0,
                status?.trainee_controller_id ?? 0,
              ]}
              exclude={[State.trainee[0]?.id ?? 0]}
              until={{
                date: date.toSerialized(),
              }}
            />
            <ControllerInput
              label="Trainee (Optional)"
              state={State.trainee}
              include={[
                status?.controller_id ?? 0,
                status?.trainee_controller_id ?? 0,
              ]}
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
              />
              <Button label="Closed" width="100%" onClick={HandleClose} />
            </Container>
          </Container>
        </Fragment>
      )}
    </Container>
  );
};

export default PositionPopupInner;
