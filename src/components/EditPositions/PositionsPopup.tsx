import { DatePicker } from "@mui/lab";
import { TextField } from "@mui/material";
import { useEffect, useState } from "react";
import DB from "../../DB";
import { Positions } from "../../db-typings/electron/Models";
import Button from "../../inputs/Button";
import StateCheckbox from "../../inputs/Checkbox";
import StateTextInput from "../../inputs/StateTextInput";
import StateTimeSelect from "../../inputs/StateCustomTimeSelect";
import Container from "../../reusable/components/Container";
import Popup from "../../reusable/components/Popup";
import { isEmpty } from "../../reusable/functions";
import useReRender from "../../reusable/hooks/useReRender";
import LocalDate from "../../reusable/LocalDate";

interface PositionsPopupProps {
  trigger: React.ReactElement;
  position: null | Positions;
  onAction?: (open: boolean) => void;
}

const PositionsPopup = (props: PositionsPopupProps) => {
  const [open, __setOpen] = useState(false);
  const setOpen = (open: boolean) => {
    props.onAction && props.onAction(open);
    if (!open) {
      Object.keys(State).forEach((key) =>
        (State as any)?.[key][1]((initialValues as any)[key])
      );
    }
    __setOpen(open);
  };
  const position = props.position;

  const initialValues = {
    name: position?.name ?? "",
    shorthand: position?.shorthand ?? "",
    relief_time_min: position?.relief_time_min ?? 60,
    proficiency_time_min: position?.proficiency_time_min ?? 60,
    relief_exempt: !!(position?.relief_exempt ?? false),
    created_date: position
      ? LocalDate.fromSerialized(position.created_date)
      : new LocalDate(),
  };

  const State = {
    name: useState(initialValues.name),
    shorthand: useState(initialValues.shorthand),
    relief_time_min: useState(initialValues.relief_time_min),
    proficiency_time_min: useState(initialValues.proficiency_time_min),
    relief_exempt: useState(initialValues.relief_exempt),
    created_date: useState(initialValues.created_date),
  };
  useEffect(() => {
    Object.keys(State).forEach((key) =>
      (State as any)?.[key][1]((initialValues as any)[key])
    );
  }, [position]);

  const { ReRender, counter } = useReRender();

  const HandleSave = async () => {
    const result = Object.fromEntries(
      Object.keys(State).map((key) => {
        const value = (State as any)[key][0];
        return [key, value];
      })
    );
    const UpdatedPosition = Object.assign(result, {
      id: position?.id ?? 0,
      position: position?.position ?? null,
      relief_exempt: result.relief_exempt ? 1 : 0,
      created_date: (result.created_date as LocalDate).toSerialized(),
    }) as Positions;

    if (isEmpty(UpdatedPosition.name, UpdatedPosition.shorthand)) {
      return;
    }

    try {
      if (UpdatedPosition.id === 0) {
        await DB.Positions.Insert(UpdatedPosition);
      } else {
        await DB.Positions.Update(UpdatedPosition);
      }
    } catch (error) {
      if (
        (error as Error)
          .toString()
          .includes("UNIQUE constraint failed: positions.shorthand")
      ) {
        State.shorthand[1]("");
        return setTimeout(() => alert("Shorthand must be unique."));
      }
      throw error;
    }

    setOpen(false);
    ReRender();
  };

  const HandleDelete = async () => {
    if (position === null) return;
    await DB.Positions.Delete(position.id);

    setOpen(false);
    ReRender();
  };

  return (
    <Popup trigger={props.trigger} state={[open, setOpen as any]}>
      <StateTextInput label="Name" state={State.name} required />
      <StateTextInput label="Shorthand" state={State.shorthand} required />
      <StateTimeSelect
        label="Proficiency Required"
        state={State.proficiency_time_min}
      />
      {!State.relief_exempt[0] && (
        <StateTimeSelect label="Relief Time" state={State.relief_time_min} />
      )}
      <DatePicker
        label="Date Created"
        value={State.created_date[0].toNormalDate()}
        onChange={(newValue:any) =>
          newValue
            ? State.created_date[1](LocalDate.fromNormalDate(newValue))
            : new LocalDate()
        }
        renderInput={(params:any) => <TextField {...params} />}
        shouldDisableDate={(day:any) => {
          const open = LocalDate.fromNormalDate(day).lte(new LocalDate());
          return !open;
        }}
      />
      <StateCheckbox label="Relief Exempt" state={State.relief_exempt} />
      <Container dir="row">
        {position && (
          <Button push="right" label="Delete" onClick={HandleDelete} />
        )}
        <Button
          push={position ? undefined : "right"}
          label={position ? "Save" : "Create"}
          onClick={HandleSave}
        />
      </Container>
    </Popup>
  );
};

export default PositionsPopup;
