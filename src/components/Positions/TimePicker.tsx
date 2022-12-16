import TimePicker from "@mui/lab/TimePicker"
import { TextField } from "@mui/material"
import React, { Fragment, useEffect, useState } from "react"
import { isNumeric } from "../../reusable/functions"
import LocalTime from "../../reusable/LocalTime"
import UTCTime from "../../reusable/UTCTime"

type StateType<T extends any> = [T, React.Dispatch<React.SetStateAction<T>>]

interface StateTimePickerProps {
  label: string
  state?: StateType<LocalTime | null>
  required?: boolean
  shouldDisableFuture?: boolean

  setError?: React.Dispatch<React.SetStateAction<string | null>>
}

const StateTimePicker = (props: StateTimePickerProps) => {
  const selfManaged = useState<LocalTime | null>(new LocalTime())
  const state = props.state ?? selfManaged

  const { required = false } = props

  let value: Date | null = null
  if (state[0] !== null) {
    value = new Date()
    value.setHours(state[0].hour, state[0].minute, state[0].second)
  }

  return (
    <div id="timepickercss">
      <TimePicker
        ampm={false}
        value={value}
        onError={(error:any) => {
          if (props.setError) {
            props.setError((required && value === null) ? "required" : error)
          }
        }}
        onChange={(newValue:any) => {
          if (newValue === null) {
            state[1](null)
          } else {
            const newTime = new LocalTime({
              hour: newValue.getHours(),
              minute: newValue.getMinutes(),
              second: newValue.getSeconds()
            })
            state[1](newTime)
          }
        }}
        maxTime={props.shouldDisableFuture ? new Date() : undefined}
        renderInput={(params:any) => {
          if (state[0] !== null) {
            const hours = state[0]?.hour ?? 0
            const minutes = state[0]?.minute ?? 0
  
            const localTime = new LocalTime({
              hour: hours,
              minute: minutes,
              second: 0
            })
  
            const utcTime = localTime.convertToUTC()
  
            const inputProps = params.inputProps as any
            params.inputProps = Object.assign(inputProps, {
              value: `${utcTime.formatToZ()} | ${localTime.formatToString()}`
            })
          }
          params.error = (required && value === null) ? true : params.error
          return (
            <TextField
              {...params}
              onKeyDown={(event:any) => {
                if (event.key === "Backspace") {
                  const input = event.target as HTMLInputElement
                  input.value = ""
                }
              }}
              onBeforeInput={(event:any) => {
                event.preventDefault();
                const input = event.target as HTMLInputElement
  
                const newInput = (event.nativeEvent as any).data
                const newValue = (input.value.length >= 4 ? newInput : (input.value + newInput)).substring(0, 4)
  
                if (!isNumeric(newInput)) {
                  return
                }
  
                if (newValue.length === 4) {
                  const [hour, minute] = [parseInt(newValue.substring(0, 2)), parseInt(newValue.substring(2, 4))]
                  const utcTime = new UTCTime({
                    hour,
                    minute,
                    second: 0
                  })
  
                  const localTime = LocalTime.convertFromUTC(utcTime)
                  state[1](localTime)
                } else {
                  // Is lesser than 4, because of substring
                  input.value = newValue
                }
              }}
              label={props.label}
              required={required}
            />
          )
        }}
      />
    </div>
  )

}

export default StateTimePicker