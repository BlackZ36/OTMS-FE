import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function SidebarNav({ className, items, ...props }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [val, setVal] = useState(location.pathname ?? "/profile");

  const handleSelect = (e) => {
    setVal(e);
    navigate(e);
  };

  return (
    <>
      <div className="p-1 md:hidden">
        <Select value={val} onValueChange={handleSelect}>
          <SelectTrigger className="h-12 sm:w-48">
            <SelectValue placeholder="Theme" />
          </SelectTrigger>
          <SelectContent>
            {items.map((item) => (
              <SelectItem key={item.href} value={item.href}>
                <div className="flex gap-x-4 px-2 py-1">
                  <span className="scale-125">{item.icon}</span>
                  <span className="text-md">{item.title}</span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <ScrollArea orientation="horizontal" type="always" className="hidden w-full min-w-40 bg-background px-1 py-2 md:block">
        <nav className={cn("flex space-x-2 py-1 lg:flex-col lg:space-x-0 lg:space-y-1", className)} {...props}>
          {items.map((item) => (
            <Link key={item.href} to={item.href} className={cn(buttonVariants({ variant: "ghost" }), location.pathname.toLowerCase() === item.href.toLowerCase() ? "bg-muted hover:bg-muted" : "hover:bg-transparent hover:underline", "justify-start")}>
              <span className="mr-2">{item.icon}</span>
              {item.title}
            </Link>
          ))}
        </nav>
      </ScrollArea>
    </>
  );
}
