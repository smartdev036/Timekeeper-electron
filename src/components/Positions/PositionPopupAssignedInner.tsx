import { Fragment, useState, useEffect } from "react";
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
import ControllerAssignedInput from "./ControllerAssignedInput";
import styles from "./PositionPopupAssignedInner.module.scss";
import StateTimePicker from "./TimePicker";
import PositionPopupInner from "./PositionPopupInner";
import Popup from "../../reusable/components/Popup";
import useAsyncRefresh from "../../reusable/hooks/useAsyncRefresh";
import { convertSecondUnitByMinute } from "../../reusable/utils/convertSecondUnit";

interface OptionType {
	label: string;
	id: number;
	group?: string;
}

interface PositionPopupAssignedInnerProps {
	date: LocalDate;
	position: Positions;
	combined?: string;
	status?: LogTimes & {
		controller_initials: string;
		trainee_initials: string;
	};
	closePopup: () => void;
}

const PositionPopupAssignedInner = ({
	position,
	closePopup,
	date,
	status,
	...props
}: PositionPopupAssignedInnerProps) => {
	const { ReRender, counter } = useReRender();
	const PopupInnerOpenState = useState(false);

	const isDateToday = date.toSerialized() === new LocalDate().toSerialized();
	// if (!isDateToday) {
	//     initalTime.setHours(23, 59, 59)
	// }

	const State = {
		time: useState<LocalTime | null>(new LocalTime()),
		controller: useState<OptionType | null>(null),
		trainee: useState<OptionType | null>(null),
	};

	const { value: positions_value } = useAsyncRefresh(
		() => DB.Positions.GetAll(date.toSerialized()),
		[DB, date, counter]
	);

	// Position Map
	const positionMap = Object.fromEntries(
		positions_value?.result.map((position) => [position.position, position]) ??
			[]
	);

	const [new_position, setNewPosition] = useState(position);

	// useEffect(() => {
	// 	(async () => {
	// 		console.log("useEffect: ", position, date, status, { ...props });
	// 		await DB.LogTimes.Add({
	// 			position_id: 8,
	// 			controller_id: 32,
	// 			trainee_controller_id: 31,
	// 			log_date: "2023-03-22",
	// 			start_time: 45840,
	// 		});
	// 	})();

	// 	// console.log('useEffect: ', await (await DB.PositionCombinations.TestDBCall(new LocalDate().toSerialized(), position.id)).result)
	// }, []);

	useEffect(() => {
		(async () => {
			// console.log('State.controller: ', State.controller[0])
			if (State.controller[0]?.group === "Assigned Controllers") {
				// console.log("t_position_id start")
				let t_position_id = (
					await DB.LogTimes.GetPositionByControllerId(
						State.controller[0]?.id ?? 0,
						date.toSerialized()
					)
				).result;
				if (t_position_id === position.position) {
					ElectronAlert("You are already on that posiiton!");
					return;
				}
				if (await ElectronConfirm("Do you want to exchange this position?")) {
					// console.log("t_position_id ", t_position_id)
					setNewPosition(positionMap[t_position_id]);
					PopupInnerOpenState[1](true);
				}
			} else {
				PopupInnerOpenState[1](false);
			}
		})();
	}, [State.controller[0]]);

	const TimeErrorState = useState<string | null>(null);

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
		console.log("state.time: ", State.time[0]);

		if (State.time[0] === null) return;
		if (State.controller[0] === null) return;
		if (TimeErrorState[0])
			return setTimeout(() => ElectronAlert("Enter a valid time."));
		if (!(await ConfirmFutureTime("adding", State.time[0]))) return;

		if (status?.controller_id != State.controller[0].id) {
			if (State?.trainee[0]?.id != status?.controller_id) {
				// If not exist, so new one
				try {
					await DB.Bullpen.Add(Number(status?.controller_id));
				} catch (e) {
					console.log("error: ", e);
				}
				// await DB.Bullpen.UpdateTimeSinceInActive(
				//   Number(status?.controller_id),
				//   new Date().getTime().toString()
				// );
			}
			if (status?.trainee_controller_id != State?.controller[0].id) {
				try {
					DB.Bullpen.Delete(Number(State.controller[0].id));
				} catch (e) {
					console.log("error2: ", e);
				}
			}
			//   DB.Bullpen.UpdateTimeSinceInActive(State.controller[0].id, "0");
		}

		if (
			status?.trainee_controller_id != State.controller[0].id &&
			status?.trainee_controller_id != State?.trainee[0]?.id
		) {
			try {
				await DB.Bullpen.Add(Number(status?.trainee_controller_id));
			} catch (e) {
				console.log("error3: ", e);
			}
			// await DB.Bullpen.UpdateTimeSinceInActive(
			//   Number(status?.trainee_controller_id),
			//   new Date().getTime().toString()
			// );
		}

		if (State?.trainee[0]?.id) {
			if (
				status?.controller_id != State?.trainee[0]?.id &&
				status?.trainee_controller_id != State?.trainee[0]?.id
			) {
				try {
					await DB.Bullpen.Delete(Number(State?.trainee[0]?.id));
				} catch (e) {
					console.log("error4: ", e);
				}
			}
		}
		DB.Bullpen.UpdateTimeSinceInActive(Number(State?.trainee[0]?.id), "0");

		await DB.PositionCombinations.insert_tbl_pos(
			position.id,
			position.id,
			date.toSerialized()
		);
		await HandleDecombine();
		console.log("handleDecombine", {
			position_id: position.id,
			controller_id: State.controller[0].id,
			trainee_controller_id: State.trainee[0]?.id ?? 0,
			log_date: date.toSerialized(),
			start_time: State.time[0].toSerialized(),
		});

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
				await DB.Bullpen.Add(Number(status?.trainee_controller_id));
				await DB.Bullpen.UpdateTimeSinceInActive(
					Number(status?.trainee_controller_id),
					new Date().getTime().toString()
				);
			} catch (e) {
				console.log("Popup Iner: ", e);
			}
		}
		if (status?.controller_id) {
			try {
				await DB.Bullpen.Add(Number(status?.controller_id));
				await DB.Bullpen.UpdateTimeSinceInActive(
					Number(status?.controller_id),
					new Date().getTime().toString()
				);
			} catch (e) {
				console.log("popup error: ", e);
			}
		}

		await DB.PositionCombinations.insert_tbl_pos(
			position.id,
			position.id,
			date.toSerialized()
		);
		await HandleDecombine();

		await DB.LogTimes.Close({
			position_id: position.id,
			log_date: date.toSerialized(),
			start_time: State.time[0].toSerialized(),
		});
		closePopup();
		ReRender();
	});

	const HandleDecombine = async () => {
		if (props.combined) {
			await DB.PositionCombinations.Decombine(position.id, date.toSerialized());
		}
	};

	return (
		<Container className={styles.PopupInner} noMargin={true}>
			<Container noMargin={true} className={styles.PopupHeading}>
				<div className={styles.OverflowWrapper}>{position.name}</div>
				<div className={styles.OverflowWrapper}>{position.shorthand}</div>
				{props.combined && (
					<div className={styles.CombinedMessage}>
						{"( Combined with "}
						<strong>{props.combined}</strong>
						{")"}
					</div>
				)}
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
					<ControllerAssignedInput
						label="Controller"
						state={State.controller}
						required
						include={
							!props.combined
								? [
										status?.controller_id ?? 0,
										status?.trainee_controller_id ?? 0,
								  ]
								: []
						}
						exclude={[State.trainee[0]?.id ?? 0]}
						until={{
							date: date.toSerialized(),
						}}
					/>
					<ControllerInput
						label="Trainee (Optional)"
						state={State.trainee}
						include={
							!props.combined
								? [
										status?.controller_id ?? 0,
										status?.trainee_controller_id ?? 0,
								  ]
								: []
						}
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
							start_time={
								State.time[0]?.toSerialized() ?? new LocalTime().toSerialized()
							}
						/>
						<Button label="Closed" width="100%" onClick={HandleClose} />
					</Container>
				</Container>
				<Popup small state={PopupInnerOpenState} trigger={<></>}>
					{new_position && (
						<PositionPopupInner
							date={date}
							time={State.time[0] ?? new LocalTime()}
							position={new_position}
							status={status}
							combined={props.combined}
							closePopup={() => PopupInnerOpenState[1](false)}
						/>
					)}
				</Popup>
			</Fragment>
		</Container>
	);
};

export default PositionPopupAssignedInner;
