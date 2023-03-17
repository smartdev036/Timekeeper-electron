import Button from "../../inputs/Button";
import { MdBackup } from "react-icons/md";
import DB from "../../DB";
import { useEffect, useState } from "react";
import Popup from "../../reusable/components/Popup";
import CopyText from "../../reusable/components/CopyText";
import AsyncErrorCatcher from "../../reusable/utils/AsyncErrorCatcher";
import { Box, Switch, Typography } from "@mui/material";
import { useAppSetting } from "../../context/AppSettingProvider";

const Settings = () => {
	const [uploading, setUploading] = useState(false);
	const [uploadLink, setUploadLink] = useState("");
	const PopupOpenState = useState(false);

	// const { appsetting, dispatch } = useAppSetting();
	// const { isdaylight } = appsetting;

	// const updateDaylightSetting = (result: number) => {
	// 	dispatch({ type: "daylight", payload: { isdaylight: result } });
	// };

	// useEffect(() => {
	// 	(async () => {
	// 		let response = await DB.Appsetting.GetDaylight();
	// 		updateDaylightSetting(response.result);
	// 	})();
	// }, []);

	// const handleDaylightChange = async (
	// 	event: React.ChangeEvent<HTMLInputElement>
	// ) => {
	// 	let isdaylight = event.target.checked ? 1 : 0;
	// 	let response = await DB.Appsetting.UpdateIsDaylight(isdaylight);
	// 	updateDaylightSetting(response.result);
	// };

	return (
		<>
			<Button
				disabled={uploading}
				label={uploading ? "Generating Link" : "Share Database"}
				margin={[40, 10]}
				size="large"
				icon={MdBackup}
				onClick={AsyncErrorCatcher(async () => {
					setUploading(true);
					try {
						const result = await DB.Scripts.UploadDB();
						setUploading(false);
						setUploadLink(result.result);
						PopupOpenState[1](true);
					} catch (error) {
						setUploading(false);
						throw error;
					}
				})}
			/>
			<Popup trigger={<div></div>} state={PopupOpenState}>
				<CopyText text={uploadLink} />
			</Popup>
			{/* <Box sx={{ display: "flex", alignItems: "center" }}>
				<Switch
					checked={isdaylight}
					onChange={handleDaylightChange}
					inputProps={{ "aria-label": "Controlled" }}
				/>
				<Typography variant="h6" component="h2">
					Turn {isdaylight ? "on" : "off"} Daylight timezone
				</Typography>
			</Box> */}
		</>
	);
};
export default Settings;
