import DB, { ElectronAlert } from "../../DB";
import { Positions } from "../../db-typings/electron/Models";
import Button from "../../inputs/Button";
import Heading from "../../reusable/components/Heading";
import Popup from "../../reusable/components/Popup";
import useAsyncRefresh from "../../reusable/hooks/useAsyncRefresh";
import useReRender from "../../reusable/hooks/useReRender";
import LocalDate from "../../reusable/LocalDate";
import PositionMiniBoxGrid from "../EditPositions/PositionMiniBoxGrid";

interface CombinePopupProps {
  position: Positions;
  closePopup: () => void;
  date: LocalDate;
  trainee_controller_id?: number;
  controller_id?: number;
  start_time: number;
}

const CombinePopup = (props: CombinePopupProps) => {
  const { counter, ReRender } = useReRender();
  const { value: positions_value } = useAsyncRefresh(
    () => DB.Positions.GetAll(),
    [counter]
  );
  console.log(props);

  const HandleCombine = async (position: Positions | null) => {
    console.log('position: ', position, props)
    if (position === null) return;
    try {
      await DB.PositionCombinations.Decombine(props.position.id, props.date.toSerialized() )
      await DB.PositionCombinations.Combine(
        props.position.id,
        position.id,
        props.date.toSerialized(),
        props.start_time,
      );
      DB.Bullpen.UpdateTimeSinceInActive(
        Number(props?.controller_id),
        new Date().getTime().toString()
      );
      props?.trainee_controller_id &&
        DB.Bullpen.UpdateTimeSinceInActive(
          props.trainee_controller_id,
          new Date().getTime().toString()
        );
      props.closePopup();
      ReRender();    
    } catch (error) {
      if ((error as Error).message.includes("position_B is empty")) {
        return setTimeout(() => {
          ElectronAlert(
            `${position.shorthand} must be either assigned a controller, be closed, or combined with another position.`
          );
        });
      } 
      else if ((error as Error).message.includes("Already exists")) {
        return setTimeout(() => {
          ElectronAlert(
            `${position.shorthand} is already combined with ${props.position.shorthand}`
          );
        });
      }
      throw error;
    }
  };

  return (
    <Popup trigger={<Button label="Combine" width="100%" />}>
      <Heading
        label={`Where would you like to move ${props.position.name} (${props.position.shorthand})?`}
        level="h4"
      />
      <PositionMiniBoxGrid
        positions={
          positions_value?.result.filter(
            (position) =>
              position.position !== null && position.id !== props.position.id
          ) ?? []
        }
        selected={null}
        onSelect={HandleCombine}
      />
    </Popup>
  );
};

export default CombinePopup;
