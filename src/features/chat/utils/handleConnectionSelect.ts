import { NavigateFunction } from "react-router-dom";
import { Connection } from "../types";

export const handleConnectionSelect = (connection: Connection, 
    selectedConnection: Connection | null, 
    navigate: NavigateFunction) => {
      navigate(`/chat/${connection.id}`);
    };