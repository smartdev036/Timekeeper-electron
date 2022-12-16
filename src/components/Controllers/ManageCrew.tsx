import { Autocomplete, createFilterOptions, TextField } from "@mui/material"
import DB from "../../DB"
import { clone } from "../../reusable/functions"
import useAsyncRefresh from "../../reusable/hooks/useAsyncRefresh"
import useReRender from "../../reusable/hooks/useReRender";

interface OptionType {
    label: string
    id: number
}

interface ManageCrewProps {
    valueRef: React.MutableRefObject<OptionType | null>
}

const MaterialOptionsFilter = createFilterOptions<OptionType>();

const ManageCrew = (props: ManageCrewProps) => {
    const {ReRender, counter} = useReRender()
    const {value: crew_value} = useAsyncRefresh(() => DB.Crew.GetAll(), [DB, counter])
    const crew: OptionType[] = crew_value?.result.map(crew => ({
        label: crew.name,
        id: crew.id
    })) ?? []

    return (
        <Autocomplete
        disablePortal
        freeSolo
        clearOnBlur
        options={crew}
        renderInput={(params) => <TextField {...params} label="Crew Assigned" />}
        renderOption={(props, option) => <li {...props}>{option.id === 0 ? `Add "${option.label}"` : option.label}</li>}
        defaultValue={props.valueRef.current}
        onChange={(_, newValue) => {
            if (!newValue?.toString().trim()) {
                props.valueRef.current = null
            } else if (typeof newValue === "string") {
                props.valueRef.current = {
                    label: newValue,
                    id: 0,
                }
            } else {
                props.valueRef.current = clone(newValue)
            }
        }}
        filterOptions={(options, params) => {
            const filtered = MaterialOptionsFilter(options, params);

            const { inputValue } = params;
            // Suggest the creation of a new value
            const isExisting = options.some((option) => inputValue === option.label);

            if (inputValue !== '' && !isExisting) {
                filtered.push({
                    id: 0,
                    label: inputValue
                });
            }
    
            return filtered;
        }}
        isOptionEqualToValue={(option, value) => JSON.stringify(option) === JSON.stringify(value)}
        />
    )
}

export default ManageCrew