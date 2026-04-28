import { configureStore } from "@reduxjs/toolkit";
import authSlice from '../authslice';
const Stores = configureStore({
    reducer:{
    auth: authSlice
    }
})

export default Stores;