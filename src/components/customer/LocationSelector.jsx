import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import {
  Command,
  CommandInput,
  CommandItem,
  CommandList,
  CommandEmpty,
} from "@/components/ui/command";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Search } from "lucide-react";
import { fetchProvinces } from "@/services/provinceService";
import { useDispatch, useSelector } from "react-redux";



export default function LocationSelector({ value, valueId, onChange }) {
  const [open, setOpen] = useState(false);
  const dispatch = useDispatch();

  const { list: provinces, loading } = useSelector((state) => state.province);
  useEffect(() => {
    if (!provinces.length) {
      fetchProvinces(dispatch);
    }
  }, [dispatch, provinces.length]);

  useEffect(() => {
    if (!value && valueId && provinces.length) {
      const found = provinces.find((p) => p._id === valueId);
      if (found) onChange(found);
    }
  }, [value, valueId, provinces, onChange]);

  const handleSelect = (provId) => {
    const prov = provinces.find((p) => p._id === provId);
    if (prov) {
      onChange(prov);
      setOpen(false);
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className="w-full sm:w-[250px] justify-start font-normal"
        >
          <Search className="mr-2 h-4 w-4 text-gray-500" />
          {value?.name || (
            <span className="text-muted-foreground">Tỉnh thành</span>
          )}
        </Button>
      </PopoverTrigger>

     
      <PopoverContent className="p-0 w-[250px]">
        <Command loop>
          <CommandInput
            placeholder={loading ? "Đang tải…" : "Tìm tỉnh/thành…"}
            className="h-9"
            disabled={loading}
            autoFocus
          />

          <ScrollArea className="h-60">
            <CommandList>
              {provinces.map((prov) => (
                <CommandItem
                  key={prov._id}
                  value={prov._id}
                  onSelect={handleSelect}
                  className="cursor-pointer"
                >
                  {prov.name}
                </CommandItem>
              ))}

              {!loading && provinces.length === 0 && (
                <CommandEmpty>Không tìm thấy</CommandEmpty>
              )}
            </CommandList>
          </ScrollArea>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
