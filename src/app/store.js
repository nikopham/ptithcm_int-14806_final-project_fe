import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../features/auth/authSlice";
import provinceReducer from "../features/province/provinceSlice";
import homestayReducer from "@/features/homestay/homestaySlice";
import communeReducer from "@/features/commune/communeSlice";
import amenityReducer from "@/features/amenity/amenitySlice";
import customerReducer from "@/features/customer/customerSlice";
import employeeReducer from "@/features/employee/employeeSlice";
import uploadReducer from "@/features/cloudinary/uploadSlice";
import bookingReducer from "@/features/booking/bookingSlice";
import movieReducer from "@/features/movie/movieSlice";
import accountReducer from "@/features/account/accountSlice";
import { injectStore } from "@/services/axiosInstance";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    province: provinceReducer,
    homestay: homestayReducer,
    commune: communeReducer,
    amenity: amenityReducer,
    customer: customerReducer,
    employee: employeeReducer,
    upload: uploadReducer,
    booking: bookingReducer,
    movie: movieReducer,
    account: accountReducer,
  },
});
  
injectStore(store);
export default store;