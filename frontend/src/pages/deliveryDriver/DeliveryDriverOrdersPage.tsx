import * as React from "react";
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { MoreHorizontal } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { DeliveryOrder, PaginatedResponse } from "@/types";
import {
  deleteDeliveryOrder,
  fetchDriverOrders,
  updateDeliveryOrderStatus,
} from "@/services/api";
import { DeliveryDriverHeader } from "@/components/Layout/DeliveryDriverHeader";
import { UserRoundPenIcon } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import Loader from "@/components/Layout/Loader";
import { DrawerDialogDemo } from "@/components/ui/DrawerDialogDemo";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

export const STATUS_CHOICES: [string, string][] = [
  ["pending", "Pending"],
  ["accepted", "Accepted"],
  ["in_progress", "In Progress"],
  ["delivered", "Delivered"],
  ["cancelled", "Cancelled"],
];

export const DeliveryDriverOrdersPage: React.FC = () => {
  const [orders, setOrders] = React.useState<DeliveryOrder[]>([]);
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    getOrders();
  }, []);

  const getOrders = async () => {
    try {
      const response = await fetchDriverOrders();
      const data: PaginatedResponse<DeliveryOrder> = response.data;
      setOrders(data.results);
    } catch (error) {
      console.error("Failed to fetch orders:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const columns: ColumnDef<DeliveryOrder>[] = [
    {
      accessorKey: "id",
      header: "Order ID",
    },
    {
      accessorKey: "order.user.username",
      header: "Assigned by",
    },
    {
      accessorKey: "order.total_amount",
      header: () => <div>Total Amount</div>,
      cell: ({ row }) => (
        <div className="capitalize">
          QAR {row.getValue("order_total_amount")}
        </div>
      ),
    },
    {
      accessorKey: "order.address",
      header: "Address",
      cell: ({ row }) => (
        <div className="capitalize max-w-[250px]">
          {row.getValue("order_address")}
        </div>
      ),
    },
    {
      accessorKey: "order.payment_method",
      header: "Payment Method",
      cell: ({ row }) => (
        <div className="capitalize">{row.getValue("order_payment_method")}</div>
      ),
    },
    {
      accessorKey: "created_at",
      header: "Ordered at",
      cell: ({ row }) =>
        row.getValue("created_at")
          ? format(new Date(row.getValue("created_at")), "PPpp")
          : "N/A",
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const [open, setOpen] = React.useState(false);
        console.log(orders);

        return (
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={open}
                className="w-[200px] justify-between"
                onClick={() => setOpen((prevOpen) => !prevOpen)}
              >
                {row.getValue("status") !== undefined
                  ? STATUS_CHOICES.find(
                      ([value]) => value === row.getValue("status")
                    )![1]
                  : "Select status..."}
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[200px] p-0">
              <Command>
                <CommandList>
                  <CommandEmpty>No status found.</CommandEmpty>
                  <CommandGroup>
                    {STATUS_CHOICES.map(([value, label]) => (
                      <CommandItem
                        key={value}
                        value={value}
                        onSelect={(currentValue) => {
                          updateDeliveryOrderStatus(
                            row.original.id,
                            currentValue
                          );
                          setOpen(false);
                          setTimeout(() => {
                            getOrders();
                          }, 100);
                        }}
                      >
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            value === row.getValue("status")
                              ? "opacity-100"
                              : "opacity-0"
                          )}
                        />
                        {label}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        );
      },
    },
    {
      id: "actions",
      enableHiding: false,
      cell: ({ row }) => {
        const order = row.original;

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem
                onClick={() => handleDeleteOrder(order.id)}
                className="text-red-500"
              >
                Delete Order
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  const table = useReactTable({
    data: orders,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
  });

  const handleDeleteOrder = async (orderId: number) => {
    try {
      await deleteDeliveryOrder(orderId);
      setOrders((prevOrders) =>
        prevOrders.filter((order) => order.id !== orderId)
      );
    } catch (error) {
      console.error("Failed to update order status:", error);
    }
  };

  return (
    <div className="container mt-10">
      <DeliveryDriverHeader />

      <div className="flex justify-between items-center mt-6 mb-2">
        <h1 className="text-2xl font-bold">My Orders</h1>
        <DrawerDialogDemo>
          <Avatar className="cursor-pointer flex items-center justify-center">
            <UserRoundPenIcon size={28} className="flex items-center" />
          </Avatar>
        </DrawerDialogDemo>
      </div>

      {isLoading ? (
        <Loader />
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => {
                    return (
                      <TableHead key={header.id}>
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                      </TableHead>
                    );
                  })}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && "selected"}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="h-24 text-center"
                  >
                    No orders available.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
};
