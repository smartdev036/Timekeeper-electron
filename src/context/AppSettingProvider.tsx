import { createContext, useContext, useReducer } from "react";

interface appsetting {
	isdaylight: boolean;
}
interface appsettingAction {
	type: string;
	payload: appsetting;
}

const initialSetting: appsetting = {
	isdaylight: false,
};

const settingReducer = (state: appsetting, action: appsettingAction) => {
	switch (action.type) {
		case "daylight":
			return { ...state, isdaylight: action.payload.isdaylight };
		default:
			return state;
	}
};

const SettingContext = createContext<any>(null);

export const useAppSetting = () => {
	const { appsetting, dispatch } = useContext(SettingContext);
	return {
		appsetting,
		dispatch,
	};
};

function AppSettingProvider({ children }: { children: React.ReactNode }) {
	const [appsetting, dispatch] = useReducer(settingReducer, initialSetting);

	return (
		<SettingContext.Provider value={{ appsetting, dispatch }}>
			{children}
		</SettingContext.Provider>
	);
}

export default AppSettingProvider;
