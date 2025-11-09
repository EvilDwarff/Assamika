import { Children, createContext, useState } from "react";
 

// eslint-disable-next-line react-refresh/only-export-components
export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const userInfo = localStorage.getItem('userInfo');
    const [user, setUser] = useState(userInfo);


    const login = (user) => {
        setUser(user)
    }

    const logout = () => {
        localStorage.removeItem('userInfo');
        setUser(null)
    }


    return <AuthContext.Provider value={{
        user,
        login,
        logout
    }}>
        {children}
    </AuthContext.Provider>
}