import { Routes, Route, Navigate } from "react-router-dom";
import CustomerLayout from "../layouts/CustomerLayout";
import AdminLayout from "../layouts/AdminLayout";
import LoginPage from "../pages/LoginPage";
import ProtectedRoute from "./ProtectedRoute";
import LandingPage from "@/pages/LandingPage";
import SearchPage from "@/pages/SearchPage";
import HomestayDetailPage from "@/pages/HomestayDetailPage";
import SubmitCheckinInfo from "@/pages/SubmitCheckinInfo";
import CustomerList from "@/components/admin/CustomerList";
import EmployeeList from "@/components/admin/EmployeeList";
import EmployeeEditPage from "@/components/admin/EmployeeEditPage";
import EmployeeCreatePage from "@/components/admin/EmployeeCreatePage";

import HomestayEditPage from "@/components/admin/HomestayEditPage";
import HomestayCreatePage from "@/components/admin/HomestayCreatePage";
import BookingList from "@/components/admin/BookingList";
import CustomerInfoPage from "@/components/customer/CustomerInfoPage";
import CustomerChangePassword from "@/components/customer/CustomerChangePassword";
import CustomerBookingList from "@/components/customer/CustomerBookingList";
import CustomerReviewList from "@/components/customer/CustomerReviewList";
import ReviewList from "@/components/admin/ReviewList";
import Dashboard from "@/components/admin/Dashboard";
import AdminChangePassword from "@/components/admin/AdminChangePassword";
import { MovieImporter } from "@/components/admin/MovieImporter";
import {MovieList} from "@/components/admin/MovieList";
import { MovieEditPage } from "@/components/admin/MovieEditPage";
import { MovieGridPage } from "@/components/customer/MovieGridPage";
import { MovieDetailPage } from "@/components/customer/MovieDetailPage";

const AppRouter = () => {
  return (
    <Routes>
      {/* Public */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/search" element={<SearchPage />} />
      <Route path="/check-in" element={<SubmitCheckinInfo />} />
      <Route path="/filter" element={<MovieGridPage />} />
      <Route path="/movie-info/:movieId" element={<MovieDetailPage />} />
      <Route path="/admin" element={<AdminLayout />} />
      <Route path="/homestays/:id" element={<HomestayDetailPage />} />
      <Route element={<ProtectedRoute allowedRoles={["viewer"]} />}>
        <Route path="/customer-dashboard" element={<CustomerLayout />}>
          <Route index path="info" element={<CustomerInfoPage />} />
          <Route
            index
            path="change-password"
            element={<CustomerChangePassword />}
          />
          <Route index path="booking-list" element={<CustomerBookingList />} />
          <Route index path="review-list" element={<CustomerReviewList />} />
        </Route>
      </Route>

      <Route element={<ProtectedRoute allowedRoles={["admin", "viewer"]} />}>
        <Route path="/admin-dashboard" element={<AdminLayout />}>
          <Route path="customer-list" element={<CustomerList />} />

          <Route path="booking-list" element={<BookingList />} />
          <Route path="review-list" element={<ReviewList />} />
          <Route path="change-password" element={<AdminChangePassword />} />
          {/* 
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="booking-list" element={<BookingList />} />
          <Route path="review-list" element={<ReviewList />} /> */}

          <Route element={<ProtectedRoute allowedRoles={["admin"]} />}>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="movie-list" element={<MovieList />} />
            <Route path="employee-list" element={<EmployeeList />} />

            <Route path="import-movie" element={<MovieImporter />} />
            <Route path="movie/:movieId/edit" element={<MovieEditPage />} />
            <Route
              path="homestay/:homestayId/edit"
              element={<HomestayEditPage />}
            />
            <Route
              path="employee/:accountId/edit"
              element={<EmployeeEditPage />}
            />

            <Route path="import-movie" element={<MovieImporter />} />
            {/* <Route path="payment-list" element={<PaymentList />} /> */}
          </Route>
        </Route>
      </Route>
      {/* Not found or unauthorized */}
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
};

export default AppRouter;
