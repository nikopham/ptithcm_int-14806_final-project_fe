import React from "react";

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

// Sample data
const data = {
  navMain: [
    {
      title: "Thông tin",
      url: "#",
      items: [
        { title: "Thông tin của bạn", url: "/customer-dashboard/info" },
        {
          title: "Đổi mật khẩu",
          url: "/customer-dashboard/change-password",
        },
      ],
    },
    {
      title: "Hoạt động",
      url: "#",
      items: [
        {
          title: "Danh sách phim yêu thích",
          url: "/customer-dashboard/booking-list",
        },
        {
          title: "Danh sách đánh giá",
          url: "/customer-dashboard/review-list",
        },
      ],
    },
  ],
};

export function CustomerSidebar(props) {
  const location = useLocation();
  const isActive = (url) =>
    url !== "#" &&
    (location.pathname === url || location.pathname.startsWith(url + "/"));
  return (
    <Sidebar {...props}>
      <SidebarHeader />
      <SidebarContent>
        {data.navMain.map((section) => (
          <SidebarGroup key={section.title}>
            <SidebarGroupLabel>{section.title}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {section.items.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild isActive={isActive(item.url)}>
                      <NavLink
                        to={item.url}
                        onClick={(e) => item.url === "#" && e.preventDefault()}
                      >
                        {item.title}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  );
}
