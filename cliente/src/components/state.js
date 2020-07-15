import React from "react";
import { InfoOutlined } from "@material-ui/icons";

const State = ({ children }) => {
  return (
    <div className="state">
      <InfoOutlined style={{ marginLeft: "8px", color: "var(--info)" }} />
      <div className="state-content">
        <span>{children}</span>
      </div>
    </div>
  );
};

export default State;
