import { Fragment, useEffect, useState, useCallback } from "react";
import styles from "./PositionsGrid.module.scss";
import Container from "../../reusable/components/Container";
import Popup from "../../reusable/components/Popup";
import useAsyncRefresh from "../../reusable/hooks/useAsyncRefresh";
import DB from "../../DB";
import { LogTimes, Positions } from "../../db-typings/electron/Models";
import PositionPopupInner from "./PositionPopupInner";
import PositionBoxSkeleton from "./PositionBoxSkeleton";
import useReRender from "../../reusable/hooks/useReRender";
import clsx from "clsx";
import LocalDate from "../../reusable/LocalDate";
import TopRightDatePicker from "../../inputs/TopRightDatePicker";
import { useInterval } from "react-use";
import PositionGridSkeleton from "./PositionGridSkeleton";
import LocalTime from "../../reusable/LocalTime";
import OffCanvasMenu from "../Bullpen/OffCanvasMenu";
import BullPenSide from "../Bullpen/BullpenSide";

interface PositionBoxProps {
  date: LocalDate;
  position?: Positions;
  all_position_status_values: any
  status?: LogTimes & {
    controller_initials: string;
    trainee_initials: string;
  };
  combined?: string;
  hovered: boolean;
  onHover: (hovered: boolean) => void;
}

const PositionBox = ({ position, status, ...props }: PositionBoxProps) => {
  const [minutesDiff, setMinutesDiff] = useState(0);
  const [minutesDiffForTrainee, setMinutesDiffForTrainee] = useState(0);
  const getPositionValuesForController = useCallback((position_id: any) => {
    let positionsStatusValues = props.all_position_status_values?.filter((i: any) => i.position_id == position_id)
    if(positionsStatusValues?.length && position_id){
      let time = positionsStatusValues[0].start_time
      let prevousId = positionsStatusValues[0].controller_id
      for(let i = 0; i < positionsStatusValues.length; i++){
        let tmpObj: any = positionsStatusValues[i]; 
        if(prevousId != tmpObj.controller_id){
          prevousId = tmpObj.controller_id
          return time
        }
        time = tmpObj.start_time
      }
      return time
    }else{
      return 0
    }
  }, [position, status, props])
  const getPositionValuesForTrainee = useCallback((position_id: any) => {
    let positionsStatusValues = props.all_position_status_values?.filter((i: any) => i.position_id == position_id)
    if (positionsStatusValues?.length && position_id) {
      let time = positionsStatusValues[0].start_time
      let prevousId = positionsStatusValues[0].trainee_controller_id
      for(let i = 0; i < positionsStatusValues.length; i++){
        let tmpObj: any = positionsStatusValues[i]; 
        if(prevousId != tmpObj.trainee_controller_id){
          prevousId = tmpObj.trainee_controller_id
          return time
        }
        time = tmpObj.start_time
      }
      return time
    }else{
      return 0
    }
  }, [position, status, props])

  const CalcMinDiff = useCallback(() => {
    const startTime = LocalTime.fromSerialized(
      getPositionValuesForController(position?.id) ?? 0
    ).mergeDate(LocalDate.fromSerialized(status?.log_date ?? ""));

    const dt = new Date();
    return (dt.getTime() - startTime.getTime()) / 1000 / 60;
  }, [position, status, props]);
  const CalcMinDiffForTrainee = useCallback(() => {
    const startTime = LocalTime.fromSerialized(
      getPositionValuesForTrainee(position?.id) ?? 0
    ).mergeDate(LocalDate.fromSerialized(status?.log_date ?? ""));
    const dt = new Date();
    return (dt.getTime() - startTime.getTime()) / 1000 / 60;
  }, [position, status, props]);



  useInterval(() => {
    setMinutesDiff(CalcMinDiff());
    setMinutesDiffForTrainee(CalcMinDiffForTrainee());
  }, 10 * 1000);

  useEffect(() => {
    setMinutesDiff(CalcMinDiff());
    setMinutesDiffForTrainee(CalcMinDiffForTrainee());
  }, [position, status, props]);

  const color: "closed" | "hidden" | "empty" | "red" | "blue" | "yellow" =
    status?.controller_id === 0 || props.combined
      ? "closed"
      : typeof position === "undefined"
        ? "hidden"
        : typeof status === "undefined"
          ? "empty"
          : position.relief_exempt
            ? "blue"
            : minutesDiff >= position.relief_time_min
              ? "red"
              : minutesDiff >= position.relief_time_min - 10
                ? "yellow"
                : "blue";

  const PopupOpenState = useState(false);


  return (
    <Popup
      state={PopupOpenState}
      trigger={
        <PositionBoxSkeleton
          shorthand={position?.shorthand ?? ""}
          className={clsx(styles[color])}
          hovered={props.hovered}
          onHover={props.onHover}
        >
          {props.combined ? (
            <Container noMargin={true} className={styles.Combined}>
              <div>Combined</div>
              <div>{props.combined}</div>
            </Container>
          ) : status?.controller_id === 0 ? (
            <div>Closed</div>
          ) : (
            typeof status !== "undefined" && (
              <Fragment>
                <Container dir="col" className={styles.PersonStatus}>
                  {!props.combined && (
                    <Fragment>
                        <div className={styles.PersonType}>{"Controller"}</div>
                      <Container dir="row" className={styles.PersonStatus}>
                        <div>{status.controller_initials}</div>
                        <div>{Math.round(minutesDiff)} min</div>
                      </Container>
                    </Fragment>
                  )}
                </Container>
                <Container dir="col" className={styles.PersonStatus}>
                  {(!props.combined && status.trainee_initials) && (
                    <Fragment>
                        <div className={styles.PersonType}>{"Trainee"}</div>
                      <Container dir="row" className={styles.PersonStatus}>
                        <div>{status.trainee_initials}</div>
                        <div>{Math.round(minutesDiffForTrainee)} min</div>
                      </Container>
                    </Fragment>
                  )}
                </Container>
              </Fragment>
            )
          )}
        </PositionBoxSkeleton>
      }
    >
      {position && (
        <PositionPopupInner
          date={props.date}
          position={position}
          status={status}
          combined={props.combined}
          closePopup={() => PopupOpenState[1](false)}
        />
      )}
    </Popup>
  );
};

const PositionsGrid = () => {
  const { ReRender, counter } = useReRender();

  const [date, setDate] = useState<LocalDate>(new LocalDate());
  const [sideMenuOpen, setSideMenuOpen] = useState(false)

  const { value: positions_value } = useAsyncRefresh(
    () => DB.Positions.GetAll(date.toSerialized()),
    [DB, date, counter]
  );

  // Position Map
  const positionMap = Object.fromEntries(
    positions_value?.result.map((position) => [position.position, position]) ??
    []
  );
  const positionIdLookup: {
    [position_id: number]: Positions;
  } = Object.fromEntries(
    positions_value?.result.map((position) => [position.id, position]) ?? []
  );

  // Position Status
  const { value: position_status_value } = useAsyncRefresh(
    () => DB.LogTimes.GetAllPositionsStatus(date.toSerialized()),
    [DB, date, counter]
  );
  const { value: all_position_status_values } = useAsyncRefresh(
    () => DB.LogTimes.GetAllPositionsStatusValues(date.toSerialized()),
    [DB, date, counter]
  );
 
  const positionStatusMap = Object.fromEntries(
    position_status_value?.result.map((status) => [
      status.position_id,
      status,
    ]) ?? []
  );

  const { value: combinations_value } = useAsyncRefresh(
    () => DB.PositionCombinations.GetCombinations(date.toSerialized()),
    [DB, date, counter]
  );
  const combinationsMap = combinations_value?.result ?? {};
  const { value: combinations_center_value } = useAsyncRefresh(
    () => DB.PositionCombinations.GetCombinationsCenter(date.toSerialized()),
    [DB, date, counter]
  );
  const centerMap = combinations_center_value?.result ?? {};

  const HoveringBox = useState<number | null>(null);

  const updateSideBarState = ():void => {
    setSideMenuOpen(prev => !prev)
  }


  if (positions_value === undefined
    || position_status_value === undefined
    || all_position_status_values === undefined
    || combinations_value === undefined
    || combinations_center_value === undefined
  ) return null

  return (
    <Fragment>
      <TopRightDatePicker label="Date" state={[date, setDate]} className='FarRight'/>
      <OffCanvasMenu  updateSideBarState={updateSideBarState} />
      <BullPenSide className={(sideMenuOpen ? styles.openSideBar : styles.closeSideBar )}/>
      <div id="main" className={(sideMenuOpen ? styles.openMain : styles.closeMain )}>
      <PositionGridSkeleton>
        {new Array(18).fill(null).map((_, i) => {
          const position = positionMap[i] as Positions | undefined;
          const status = positionStatusMap[position?.id ?? 0] as
            | (LogTimes & {
              controller_initials: string;
              trainee_initials: string;
            })
            | undefined;

          // All positions id's in group
          const combined = combinationsMap[position?.id ?? 0] ?? [];

          // First position of combined will be made center by default.
          // Unless we can find a forced center
          const groupCenter = centerMap[position?.id ?? 0] ?? combined[0];

          const combinedInitials =
            groupCenter === position?.id
              ? undefined
              : positionIdLookup[groupCenter ?? -1]?.shorthand;

          const hovered = (
            combinationsMap[HoveringBox[0] ?? -1] ?? []
          ).includes(position?.id ?? 0)
            ? true
            : HoveringBox[0] === position?.id ?? 0;
          const onHover = (newHover: boolean) => {
            newHover ? HoveringBox[1](position?.id ?? 0) : HoveringBox[1](null);
          };

          return (
            <PositionBox
              key={position?.id ?? `empty-${i}`}
              date={date}
              position={position}
              status={status}
              hovered={hovered}
              onHover={onHover}
              combined={combinedInitials}
              all_position_status_values={all_position_status_values?.result}
            />
          );
        })}
      </PositionGridSkeleton>
      </div>

    </Fragment>
  );
};

export default PositionsGrid;
