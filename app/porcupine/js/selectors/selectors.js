import { createSelector } from "redux-orm";

import orm from "../models/index";


export const nodeSelector = createSelector(
  orm,
  state => state.orm,
  session => {
    return session.Node.all().toRefArray();
  }
);