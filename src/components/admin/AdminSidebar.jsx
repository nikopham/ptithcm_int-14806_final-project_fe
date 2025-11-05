import React, { useState } from "react";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";
import { NavLink, useLocation } from "react-router-dom";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

// Sample data
const data = {
  navMain: [
    {
      title: "Dashboard",
      url: "#",
      items: [{ title: "Dashboard", url: "/admin-dashboard/dashboard" }],
    },
    {
      title: "Tài khoản",
      url: "#",
      items: [
        // { title: "Danh sách nhân viên", url: "/admin-dashboard/employee-list" },
        {
          title: "Danh sách người dùng",
          url: "/admin-dashboard/customer-list",
        },
        // { title: "Thêm nhân viên", url: "/admin-dashboard/add-employee" },
      ],
    },
    {
      title: "Movie",
      url: "#",
      items: [
        { title: "Danh sách phim", url: "/admin-dashboard/movie-list" },
        { title: "Thêm mới phim", url: "/admin-dashboard/import-movie" },
      ],
    },
    // {
    //   title: "Đặt homestay",
    //   url: "#",
    //   items: [
    //     { title: "Danh sách đơn đặt", url: "/admin-dashboard/booking-list" },
    //   ],
    // },
    // {
    //   title: "Thanh toán",
    //   url: "#",
    //   items: [{ title: "Danh sách thanh toán", url: "#" }],
    // },
    {
      title: "Đánh giá",
      url: "#",
      items: [
        { title: "Danh sách đánh giá", url: "/admin-dashboard/review-list" },
      ],
    },
    {
      title: "Tài khoản",
      url: "#",
      items: [
        { title: "Đổi mật khẩu", url: "/admin-dashboard/change-password" },
      ],
    },
  ],
};

export function AdminSidebar(props) {
  const location = useLocation();
  const [paymentAlertOpen, setPaymentAlertOpen] = useState(false);
  const isActive = (url) =>
    url !== "#" &&
    (location.pathname === url || location.pathname.startsWith(url + "/"));
  return (
    <>
      <Sidebar {...props}>
        <SidebarHeader />
        <SidebarContent>
          {data.navMain.map((section) => (
            <SidebarGroup key={section.title}>
              <SidebarGroupLabel>{section.title}</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {section.items.map((item) => {
                    const isPaymentList =
                      section.title === "Thanh toán" &&
                      item.title === "Danh sách thanh toán";

                    return (
                      <SidebarMenuItem key={item.title}>
                        <SidebarMenuButton
                          asChild={!isPaymentList} // dùng NavLink cho item thường, button thuần cho thanh toán
                          isActive={isActive(item.url)}
                          onClick={(e) => {
                            if (isPaymentList) {
                              e.preventDefault();
                              setPaymentAlertOpen(true);
                              return;
                            }
                            if (item.url === "#") e.preventDefault();
                          }}
                        >
                          {isPaymentList ? (
                            // Render như một button thường để bắt click
                            <button type="button">{item.title}</button>
                          ) : (
                            <NavLink
                              to={item.url}
                              onClick={(e) =>
                                item.url === "#" && e.preventDefault()
                              }
                            >
                              {item.title}
                            </NavLink>
                          )}
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    );
                  })}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          ))}
        </SidebarContent>
        <SidebarRail />
      </Sidebar>

      {/* Alert Dialog: Tính năng đang phát triển */}
      <AlertDialog open={paymentAlertOpen} onOpenChange={setPaymentAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Tính năng đang phát triển</AlertDialogTitle>
            <AlertDialogDescription>
              Phần <b>Danh sách thanh toán</b> hiện chưa khả dụng. Vui lòng quay
              lại sau.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setPaymentAlertOpen(false)}>
              Đóng
            </AlertDialogCancel>
            <AlertDialogAction onClick={() => setPaymentAlertOpen(false)}>
              Ok
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}