import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { User } from "lucide-react";

const GuestSelector = ({ value, onChange }) => {
  const { adults, children, rooms } = value;

  const update = (key, newVal) => onChange({ ...value, [key]: newVal });

  const decrement = (type) => {
    if (type === "adults" && adults > 1) update("adults", adults - 1);
    if (type === "children" && children > 0) update("children", children - 1);
    if (type === "rooms" && rooms > 1) update("rooms", rooms - 1);
  };

  const increment = (type) => {
    if (type === "adults") update("adults", adults + 1);
    if (type === "children") update("children", children + 1);
    if (type === "rooms") update("rooms", rooms + 1);
  };

   return (
     <Popover>
       <PopoverTrigger asChild>
         <Button
           variant="outline"
           className="w-full sm:w-[250px] justify-start text-left font-normal"
         >
           <User className="mr-2 h-4 w-4 text-gray-500" />
           {adults} người lớn · {children} trẻ em · {rooms} phòng
         </Button>
       </PopoverTrigger>

       <PopoverContent className="w-[250px] space-y-4" align="start">
         {[
           { label: "Người lớn", value: adults, type: "adults" },
           { label: "Trẻ em", value: children, type: "children" },
           { label: "Phòng", value: rooms, type: "rooms" },
         ].map((item, index) => (
           <div key={item.type}>
             {index !== 0 && <Separator className="my-2" />}
             <div className="flex items-center justify-between">
               <span>{item.label}</span>
               <div className="flex items-center space-x-2">
                 <Button
                   variant="outline"
                   size="icon"
                   onClick={() => decrement(item.type)}
                   disabled={
                     (item.type === "adults" && item.value === 1) ||
                     (item.type === "children" && item.value === 0) ||
                     (item.type === "rooms" && item.value === 1)
                   }
                 >
                   −
                 </Button>
                 <span className="w-6 text-center">{item.value}</span>
                 <Button
                   variant="outline"
                   size="icon"
                   onClick={() => increment(item.type)}
                 >
                   +
                 </Button>
               </div>
             </div>
           </div>
         ))}
       </PopoverContent>
     </Popover>
   );
};

export default GuestSelector;
