import InputAdornment from "@mui/material/InputAdornment";
import TextField from "@mui/material/TextField";
import { useState } from "react";

interface StateTimeSelectProps {
  label: string;
  options?: number[];
  defaultValue?: number;
  state?: [number, React.Dispatch<React.SetStateAction<number>>];
}

const StateTimeSelect = (props: StateTimeSelectProps) => {
  const selfManaged = useState<number>(props.defaultValue ?? 60);
  const state = props.state ?? selfManaged;
  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let newValue: number = Number(e.target.value);
    state[1](newValue);
  };
  const onBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    let newValue: number = Number(e.target.value)
    if(newValue < 15) {
      state[1](15);
    }
  };

  return (
    <TextField
      type="number"
      value={state[0]}
      InputProps={{
        inputProps: { maxLength: 15 },
        endAdornment: <InputAdornment position="end">Minutes</InputAdornment>,
      }}
      defaultValue={props.defaultValue ?? 60}
      onChange={onChange}
      onBlur={onBlur}
    />
  );
};

export default StateTimeSelect;
