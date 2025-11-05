// // ImageGalleryDialog.jsx
// import { useState } from "react";
// import {
//   Dialog,
//   DialogTrigger,
//   DialogContent,
//   DialogHeader,
// } from "@/components/ui/dialog";
// import { cn } from "@/lib/utils"; // helper gộp class


// export default function ImageGalleryDialog({ images, children }) {
//   const [open, setOpen] = useState(false);
//   const [active, setActive] = useState(
//     images.find((i) => i.is_thumb) || images[0]
//   );

//   return (
//     <Dialog open={open} onOpenChange={setOpen}>
//       <DialogTrigger asChild>{children}</DialogTrigger>

//       {/* ⬅️ tăng kích thước bằng max-w-5xl & rộng 90vw cho màn nhỏ */}
//       <DialogContent
//         className="w-screen sm:w-[95vw] max-w-none p-4"
//       >
//         <DialogHeader>
//           {/* ⬆️ ảnh lớn cao 600px, tràn chiều ngang dialog */}
//           <img
//             src={active.url}
//             alt="preview"
//             className="w-full h-[600px] object-cover rounded-md"
//           />
//         </DialogHeader>

//         {/* Thumbnails */}
//         <div className="mt-4 flex gap-3 overflow-x-auto">
//           {images.map((img) => (
//             <img
//               key={img._id}
//               src={img.url}
//               alt="thumb"
//               onClick={() => setActive(img)}
//               className={cn(
//                 "h-24 w-32 object-cover cursor-pointer rounded-md transition",
//                 img._id === active._id
//                   ? "ring-2 ring-primary"
//                   : "opacity-75 hover:opacity-100"
//               )}
//             />
//           ))}
//         </div>
//       </DialogContent>
//     </Dialog>
//   );
// }

import { useState } from "react";
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetClose,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

export default function ImageGallerySheet({ images, children }) {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(
    images.find((i) => i.is_thumb) || images[0]
  );

  const select = (img) => setActive(img);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      {/* BẤM COLLAGE => MỞ SHEET */}
      <SheetTrigger asChild>{children}</SheetTrigger>

      {/* FULL-WIDTH, CAO 85vh */}
      <SheetContent
        side="bottom"
        className="p-6 max-w-none w-full h-[85vh] overflow-y-auto"
      >
        <SheetHeader className="mb-4">
          <h2 className="text-lg font-semibold">{active?.title}</h2>
        </SheetHeader>

        {/* Ảnh lớn */}
        <img
          src={active.url}
          alt="preview"
          className="max-h-[60vh] max-w-full object-contain rounded-md"
        />

        {/* Thumbnails */}
        <div className="mt-4 flex gap-3 overflow-x-auto pb-2">
          {images.map((img) => (
            <img
              key={img._id}
              src={img.url}
              alt="thumb"
              onClick={() => select(img)}
              className={cn(
                "h-24 w-32 object-cover cursor-pointer rounded-md transition",
                img._id === active._id
                  ? "ring-2 ring-primary"
                  : "opacity-70 hover:opacity-100"
              )}
            />
          ))}
        </div>

        {/* Nút đóng (tuỳ thích) */}
      </SheetContent>
    </Sheet>
  );
}
