'use client'

import { useState, useEffect, useRef } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Calendar } from "@/components/ui/calendar"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { format } from 'date-fns'
import Layout from '@/components/Layout/Layout'
import { api } from '@/services/api'
import { toast, ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { Armchair } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

type Chair = {
  id: number
  chair_name: string
  customer_name?: string
  customer_mob?: string
  booked_date?: string
  start_time?: string
  end_time?: string
  amount?: number
  is_active: boolean
}

type ChairBooking = {
  id: number
  selected_chair: number
  chair_name: string
  customer_name: string
  customer_mob: string
  booked_date: string
  start_time: string
  end_time: string
  amount: number
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed'
}

type View = 'booked' | 'available' | 'book' | 'history'
type BookingStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed'

// Add this type for cell editing
type EditableCellProps = {
  value: string | number
  onChange: (value: string) => Promise<void>
  type?: 'text' | 'tel' | 'datetime-local' | 'date' | 'number'
  disabled?: boolean
}

export default function ChairBookingPage() {
  const [currentView, setCurrentView] = useState<View>('booked')
  const [chairs, setChairs] = useState<Chair[]>([])
  const [bookingHistory, setBookingHistory] = useState<ChairBooking[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchChairs()
    fetchBookingHistory()
  }, [])

  const fetchChairs = async () => {
    try {
      const response = await api.get('/chairs/')
      setChairs(response.data)
    } catch (error) {
      console.error('Error fetching chairs:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchBookingHistory = async () => {
    try {
      const response = await api.get('/chair-bookings/')
      setBookingHistory(response.data)
    } catch (error) {
      console.error('Error fetching booking history:', error)
    }
  }

  const bookedChairs = chairs.filter(chair => !chair.is_active)
  const availableChairs = chairs.filter(chair => chair.is_active)

  const BookedChairs = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {bookedChairs.map(chair => (
        <Card key={chair.id}>
          <CardHeader>
            <CardTitle>{chair.chair_name}</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Booked by: {chair.customer_name}</p>
            <p>Mobile: {chair.customer_mob}</p>
            <p>Date: {chair.booked_date ? format(new Date(chair.booked_date), 'PP') : 'N/A'}</p>
            <p>Time: {chair.start_time} - {chair.end_time}</p>
            <p>Amount: ${chair.amount}</p>
            <p>Status: {chair.is_active ? 'Active' : 'Inactive'}</p>
            <Timer endTime={chair.end_time} />
          </CardContent>
          <CardFooter>
            <Button onClick={() => handleEdit(chair.id)}>Edit Booking</Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  )

  const AvailableChairs = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {availableChairs.map(chair => (
        <Card key={chair.id}>
          <CardHeader>
            <CardTitle>{chair.chair_name}</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Status: Available</p>
            <p>Is Active: {chair.is_active ? 'Yes' : 'No'}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  )

  const BookingForm = () => {
    const [date, setDate] = useState<Date | undefined>(new Date())
    const [isChairListOpen, setIsChairListOpen] = useState(false)
    const [selectedChair, setSelectedChair] = useState<Chair | null>(null)
    const dropdownRef = useRef<HTMLDivElement>(null)

    // Add click outside handler
    useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
          setIsChairListOpen(false)
        }
      }

      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    // Replace the select element with custom dropdown
    const ChairSelector = () => (
      <div className="relative" ref={dropdownRef}>
        <div
          className={`w-full p-2 border rounded cursor-pointer ${
            selectedChair 
              ? selectedChair.is_active 
                ? 'border-green-500' 
                : 'border-red-500'
              : 'border-gray-300'
          }`}
          onClick={() => setIsChairListOpen(!isChairListOpen)}
        >
          {selectedChair ? (
            <div className="flex items-center gap-2">
              <Armchair className={selectedChair.is_active ? 'text-green-500' : 'text-red-500'} />
              {selectedChair.chair_name}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Armchair className="text-gray-400" />
              Select a chair
            </div>
          )}
        </div>
        
        {isChairListOpen && (
          <div className="absolute z-50 w-full mt-1 bg-white border rounded-md shadow-lg">
            <div className="grid grid-cols-1 gap-2 p-2 max-h-[300px] overflow-y-auto">
              {chairs.map(chair => (
                <div
                  key={chair.id}
                  className={`p-3 border rounded-md ${
                    chair.is_active 
                      ? 'border-green-500 cursor-pointer hover:bg-gray-50' 
                      : 'border-red-500 opacity-60 cursor-not-allowed'
                  }`}
                  onClick={() => {
                    if (chair.is_active) {
                      setSelectedChair(chair)
                      setIsChairListOpen(false)
                    }
                  }}
                >
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <Armchair 
                        className={chair.is_active ? 'text-green-500' : 'text-red-500'} 
                        size={20}
                      />
                      <h3 className="font-medium">{chair.chair_name}</h3>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      chair.is_active 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {chair.is_active ? 'Available' : 'Booked'}
                    </span>
                  </div>
                  {!chair.is_active && (
                    <div className="text-sm text-gray-500 mt-1 ml-7">
                      <p>Booked by: {chair.customer_name}</p>
                      <p>Until: {chair.end_time}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
        
        <input
          type="hidden"
          name="chair"
          value={selectedChair?.id || ''}
          required
        />
      </div>
    )

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault()
      const form = e.currentTarget
      
      // Create Date objects for start and end times
      const bookingDate = date || new Date()
      const startTime = form.start_time.value
      const endTime = form.end_time.value
      
      // Combine date with time and create ISO string
      const startDateTime = new Date(
        bookingDate.getFullYear(),
        bookingDate.getMonth(),
        bookingDate.getDate(),
        ...startTime.split(':').map(Number)
      ).toISOString()
      
      const endDateTime = new Date(
        bookingDate.getFullYear(),
        bookingDate.getMonth(),
        bookingDate.getDate(),
        ...endTime.split(':').map(Number)
      ).toISOString()

      const bookingData = {
        selected_chair: selectedChair?.id,
        customer_name: form.customer_name.value,
        customer_mob: form.customer_mob.value,
        start_time: startDateTime,
        end_time: endDateTime,
        amount: parseFloat(form.amount.value),
        status: 'pending',
        booked_date: bookingDate.toISOString().split('T')[0]
      }

      if (!bookingData.customer_name || !bookingData.customer_mob || !bookingData.amount) {
        toast.error('Please fill in all required fields')
        return
      }

      try {
        await api.post('/chair-bookings/', bookingData)
        toast.success('Booking created successfully!')
        fetchChairs()
        fetchBookingHistory()
        form.reset()
      } catch (error: any) {
        console.error('Error creating booking:', error)
        if (error.response?.data) {
          Object.entries(error.response.data).forEach(([key, value]) => {
            toast.error(`${key}: ${value}`)
          })
        } else {
          toast.error('Failed to create booking. Please try again.')
        }
      }
    }

    return (
      <Card className="w-full max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle>Book a Chair</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="chair">Chair</Label>
                <ChairSelector /> {/* Replace the select element with our custom component */}
              </div>
              <div className="space-y-2">
                <Label htmlFor="customer_name">Customer Name</Label>
                <Input 
                  id="customer_name" 
                  name="customer_name"
                  required 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="customer_mob">Mobile Number</Label>
                <Input 
                  id="customer_mob" 
                  name="customer_mob"
                  type="tel" 
                  required 
                />
              </div>
              <div className="space-y-2">
                <Label>Booking Date</Label>
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  className="rounded-md border"
                  disabled={(date) => date < new Date()}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="start_time">Start Time</Label>
                <Input 
                  id="start_time" 
                  name="start_time"
                  type="time" 
                  required 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="end_time">End Time</Label>
                <Input 
                  id="end_time" 
                  name="end_time"
                  type="time" 
                  required 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="amount">Amount</Label>
                <Input 
                  id="amount" 
                  name="amount"
                  type="number" 
                  step="0.01"
                  min="0"
                  required 
                />
              </div>
            </div>
            <Button type="submit" className="w-full">Book Chair</Button>
          </form>
        </CardContent>
      </Card>
    )
  }

  const EditableCell = ({ value, onChange, type = 'text', disabled = false }: EditableCellProps) => {
    const [isEditing, setIsEditing] = useState(false)
    const [tempValue, setTempValue] = useState(value)
    const [isLoading, setIsLoading] = useState(false)
    const inputRef = useRef<HTMLInputElement>(null)

    // Format the display value based on type
    const formatDisplayValue = (val: string | number) => {
      if (type === 'datetime-local') {
        try {
          // Add timezone offset to display local time
          const date = new Date(val)
          return format(date, 'dd/MM/yyyy hh:mm a')
        } catch {
          return val
        }
      }
      if (type === 'date') {
        try {
          return format(new Date(val), 'dd/MM/yyyy')
        } catch {
          return val
        }
      }
      return val
    }

    // Format the input value based on type
    const formatInputValue = (val: string | number) => {
      if (type === 'datetime-local') {
        try {
          // Convert to local datetime string for input
          const date = new Date(val)
          return format(date, "yyyy-MM-dd'T'HH:mm")
        } catch {
          return val
        }
      }
      return val
    }

    const handleClick = () => {
      if (!disabled) {
        setIsEditing(true)
      }
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setTempValue(e.target.value)
    }

    const handleSubmit = async () => {
      if (tempValue !== value) {
        setIsLoading(true)
        try {
          await onChange(tempValue.toString())
        } catch (error: any) {
          toast.error(error.response?.data?.error || 'Update failed')
          setTempValue(value)
        } finally {
          setIsLoading(false)
          setIsEditing(false)
        }
      } else {
        setIsEditing(false)
      }
    }

    const handleKeyDown = (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') {
        handleSubmit()
      } else if (e.key === 'Escape') {
        setTempValue(value)
        setIsEditing(false)
      }
    }

    return (
      <div className="relative min-h-[40px] border rounded">
        {isEditing ? (
          <input
            ref={inputRef}
            type={type}
            value={formatInputValue(tempValue)}
            onChange={handleChange}
            onBlur={handleSubmit}
            onKeyDown={handleKeyDown}
            className={`w-full h-full p-2 border-2 border-blue-500 rounded ${
              isLoading ? 'opacity-50' : ''
            }`}
            disabled={isLoading}
            autoFocus
          />
        ) : (
          <div
            onClick={handleClick}
            className="w-full h-full p-2 cursor-pointer hover:bg-gray-50 flex items-center"
            title="Click to edit"
          >
            {formatDisplayValue(value)}
          </div>
        )}
      </div>
    )
  }

  const BookingHistory = () => {
    // Initialize fromDate and toDate with today's date
    const [fromDate, setFromDate] = useState<Date>(new Date())
    const [toDate, setToDate] = useState<Date>(new Date())

    // Add state for booking history data
    const [filteredHistory, setFilteredHistory] = useState<ChairBooking[]>([])

    // Add useEffect to fetch data when dates change
    useEffect(() => {
      const fetchFilteredBookings = async () => {
        try {
          // Format dates as YYYY-MM-DD for API
          const fromDateStr = format(fromDate, 'yyyy-MM-dd')
          const toDateStr = format(toDate, 'yyyy-MM-dd')
          
          const response = await api.get('/chair-bookings/', {
            params: {
              from_date: fromDateStr,
              to_date: toDateStr
            }
          })
          setFilteredHistory(response.data)
        } catch (error) {
          console.error('Error fetching filtered bookings:', error)
          toast.error('Failed to fetch booking history')
        }
      }

      fetchFilteredBookings()
    }, [fromDate, toDate])

    return (
      <div className="w-full overflow-x-auto">
        <div className="flex gap-4 mb-4">
          <div className="flex items-center gap-2">
            <Label>From:</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline">
                  {format(fromDate, 'PP')}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={fromDate}
                  onSelect={(date) => date && setFromDate(date)}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="flex items-center gap-2">
            <Label>To:</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline">
                  {format(toDate, 'PP')}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={toDate}
                  onSelect={(date) => date && setToDate(date)}
                  initialFocus
                  disabled={(date) => date < fromDate}
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>

        <Table className="min-w-[1200px]">
          <TableHeader>
            <TableRow>
              <TableHead className="w-[150px]">Booked Date</TableHead>
              <TableHead className="w-[200px]">Customer Name</TableHead>
              <TableHead className="w-[150px]">Mobile Number</TableHead>
              <TableHead className="w-[150px]">Chair</TableHead>
              <TableHead className="w-[200px]">Start Time</TableHead>
              <TableHead className="w-[200px]">End Time</TableHead>
              <TableHead className="w-[120px]">Amount</TableHead>
              <TableHead className="w-[150px]">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredHistory.map((booking) => (
              <TableRow key={booking.id}>
                <TableCell>
                  <EditableCell
                    value={booking.booked_date}
                    onChange={(value) => updateBookingField(booking.id, 'booked_date', value)}
                    type="date"
                  />
                </TableCell>
                <TableCell>
                  <EditableCell
                    value={booking.customer_name}
                    onChange={(value) => updateBookingField(booking.id, 'customer_name', value)}
                    type="text"
                  />
                </TableCell>
                <TableCell>
                  <EditableCell
                    value={booking.customer_mob}
                    onChange={(value) => updateBookingField(booking.id, 'customer_mob', value)}
                    type="tel"
                  />
                </TableCell>
                <TableCell>
                  <div className="p-2 border rounded bg-gray-50">
                    {booking.chair_name}
                  </div>
                </TableCell>
                <TableCell>
                  <EditableCell
                    value={booking.start_time}
                    onChange={(value) => updateBookingField(booking.id, 'start_time', value)}
                    type="datetime-local"
                  />
                </TableCell>
                <TableCell>
                  <EditableCell
                    value={booking.end_time}
                    onChange={(value) => updateBookingField(booking.id, 'end_time', value)}
                    type="datetime-local"
                  />
                </TableCell>
                <TableCell>
                  <EditableCell
                    value={booking.amount}
                    onChange={(value) => updateBookingField(booking.id, 'amount', value)}   
                    type="number"
                  />
                </TableCell>
                <TableCell>
                  <select
                    value={booking.status}
                    onChange={(e) => updateBookingField(booking.id, 'status', e.target.value)}
                    className="w-full p-2 border rounded"
                  >
                    <option value="pending">Pending</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="cancelled">Cancelled</option>
                    <option value="completed">Completed</option>
                  </select>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    )
  }

  const Timer = ({ endTime }: { endTime?: string }) => {
    const [timeLeft, setTimeLeft] = useState('')

    useEffect(() => {
      if (!endTime) return
      
        const updateTimer = () => {
        const now = new Date()
        const [hours, minutes] = endTime.split(':').map(Number)
        const end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hours, minutes)

        if (now > end) {
          setTimeLeft('Booking ended')
          return
        }

        const diff = end.getTime() - now.getTime()
        const hoursLeft = Math.floor(diff / (1000 * 60 * 60))
        const minutesLeft = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))

        setTimeLeft(`${hoursLeft}h ${minutesLeft}m remaining`)
      }

      updateTimer()
      const timerId = setInterval(updateTimer, 60000) // Update every minute

      return () => clearInterval(timerId)
    }, [endTime])

    return <p className="font-bold text-primary">{timeLeft}</p>
  }

  const handleEdit = (chairId: number) => {
    // Implement edit functionality here
    console.log(`Editing chair ${chairId}`)
  }

  const updateBookingField = async (bookingId: number, field: string, value: string) => {
    try {
      // First check if the booking exists in our filtered history
      const bookingExists = bookingHistory.find(booking => booking.id === bookingId);
      
      if (!bookingExists) {
        toast.error("Booking not found. Please refresh the page.");
        return;
      }

      // Format the value based on the field type
      let formattedValue = value;
      if (field === 'start_time' || field === 'end_time') {
        // Ensure datetime is in ISO format
        formattedValue = new Date(value).toISOString();
      } else if (field === 'booked_date') {
        // Format date as YYYY-MM-DD
        formattedValue = new Date(value).toISOString().split('T')[0];
      }

      const response = await api.patch(`/chair-bookings/${bookingId}/`, {
        [field]: formattedValue
      });
      
      // Update the local state with the new value
      setBookingHistory(prevHistory => 
        prevHistory.map(booking => 
          booking.id === bookingId 
            ? { ...booking, [field]: value }
            : booking
        )
      );
      
      toast.success(`Successfully updated ${field}`);
      return response.data;
    } catch (error: any) {
      console.error(`Error updating ${field}:`, error);
      toast.error(error.response?.data?.detail || `Failed to update ${field}`);
      throw error;
    }
  }

  return (
    <Layout>
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <header className="flex flex-wrap justify-center gap-4 mb-8">
          <Button 
            onClick={() => setCurrentView('booked')}
            variant={currentView === 'booked' ? 'default' : 'outline'}
          >
            Booked Chairs ({bookedChairs.length})
          </Button>
          <Button 
            onClick={() => setCurrentView('available')}
            variant={currentView === 'available' ? 'default' : 'outline'}
          >
            Available Chairs ({availableChairs.length})
          </Button>
          <Button 
            onClick={() => setCurrentView('book')}
            variant={currentView === 'book' ? 'default' : 'outline'}
          >
            Book Now
          </Button>
          <Button 
            onClick={() => setCurrentView('history')}
            variant={currentView === 'history' ? 'default' : 'outline'}
          >
            Booking History
          </Button>
        </header>
        <main>
          {loading ? (
            <div>Loading...</div>
          ) : (
            <>
              {currentView === 'booked' && <BookedChairs />}
              {currentView === 'available' && <AvailableChairs />}
              {currentView === 'book' && <BookingForm />}
              {currentView === 'history' && <BookingHistory />}
            </>
          )}
        </main>
      </div>
    </Layout>
  )
}