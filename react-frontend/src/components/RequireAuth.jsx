import { AuthContext } from "@components/context/Auth";
import { Navigate } from "react-router-dom";
import { useContext } from "react";

export const RequireAuth = ({children}) =>{
    const {user} = useContext(AuthContext);


    if(!user){

        return <Navigate to={`/account/login`} />


    }

    return children;
}