import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuShortcut, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { authMe } from "@/services/authService";
import axiosClient from "@/services/axiosClient";
import { useStore } from "@/services/StoreContext";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

export function ProfileDropdown() {
  const { state } = useStore();
  const { user, role } = state;

  console.log("user from storeContext", user);
  console.log("role from storeContext", role);

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
          <Avatar className="h-8 w-8">
            <AvatarImage src={`${user.imgUrl ?? "N/A"}`} alt="Avatar" />
            <AvatarFallback>{user.name ?? "N/A"}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{user.name ?? "N/A"}</p>
            <p className="text-xs">
              role: <span className="font-medium">{role ?? "N/A"}</span>{" "}
            </p>
            <p className="text-xs">
              email: <span className="font-medium"> {user.email ?? "N/A"}</span>
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem asChild>
            <Link to="Profile">Profile</Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link to="Settings">Settings</Link>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link to="/Logout">Logout</Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
