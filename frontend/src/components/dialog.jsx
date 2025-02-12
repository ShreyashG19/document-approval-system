const DialogContent = React.forwardRef(({ className, ...props }, ref) => (
    <DialogPrimitive.Portal>
      <DialogPrimitive.Overlay className="fixed inset-0 bg-black/50" />
      <DialogPrimitive.Content
        ref={ref}
        className={`fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white p-6 rounded-lg shadow-lg ${className || ""}`}
        {...props}
      />
    </DialogPrimitive.Portal>
  ));
  