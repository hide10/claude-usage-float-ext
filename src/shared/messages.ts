import { UsageState } from "./types";

export type PopupMessage =
  | { type: "GET_STATE" }
  | { type: "FORCE_REFRESH" }
  | { type: "SAVE_SETTINGS"; payload: { pollIntervalSec: number } };

export type StateUpdateMessage = {
  type: "STATE_UPDATE";
  payload: UsageState;
};
