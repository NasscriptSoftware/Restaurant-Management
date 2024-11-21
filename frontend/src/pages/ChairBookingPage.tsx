'use client'

import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Calendar } from "@/components/ui/calendar"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { format } from 'date-fns'
import Layout from '@/components/Layout/Layout'
import {api} from'@/services/api'

type Chair = {
  id: number
  chair_name: string
  customer_name?: string
  customer_mob?: string
  booked_date?: Date
  start_time?: string
  end_time?: string
  amount?: number
  is_active: boolean
}

type View = 'booked' | 'available' | 'book' | 'history'

export default function Component() {
  const [currentView, setCurrentView] = useState<View>('booked')
  const [chairs, setChairs] = useState<Chair[]>([
    { id: 1, chair_name: 'Chair 1', customer_name: 'John Doe', customer_mob: '1234567890', booked_date: new Date(), start_time: '10:00', end_time: '12:00', amount: 50, is_active: true },
    { id: 2, chair_name: 'Chair 2', is_active: true },
    { id: 3, chair_name: 'Chair 3', customer_name: 'Jane Smith', customer_mob: '0987654321', booked_date: new Date(), start_time: '14:00', end_time: '16:00', amount: 50, is_active: true },
    { id: 4, chair_name: 'Chair 4', is_active: true },
  ])

  const bookedChairs = chairs.filter(chair => chair.customer_name)
  const availableChairs = chairs.filter(chair => !chair.customer_name)

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
            <p>Date: {chair.booked_date ? format(chair.booked_date, 'PP') : 'N/A'}</p>
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

    return (
      <Card className="w-full max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle>Book a Chair</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleBooking} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="chair">Chair</Label>
                <select id="chair" className="w-full p-2 border rounded" required>
                  <option value="">Select a chair</option>
                  {availableChairs.map(chair => (
                    <option key={chair.id} value={chair.id}>{chair.chair_name}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="customer_name">Customer Name</Label>
                <Input id="customer_name" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="customer_mob">Mobile Number</Label>
                <Input id="customer_mob" type="tel" required />
              </div>
              <div className="space-y-2">
                <Label>Booking Date</Label>
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  className="rounded-md border"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="start_time">Start Time</Label>
                <Input id="start_time" type="time" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="end_time">End Time</Label>
                <Input id="end_time" type="time" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="amount">Amount</Label>
                <Input id="amount" type="number" required />
              </div>
            </div>
            <Button type="submit" className="w-full">Book Chair</Button>
          </form>
        </CardContent>
      </Card>
    )
  }

  const BookingHistory = () => (
    <div className="w-full overflow-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Booked Date</TableHead>
            <TableHead>Customer Name</TableHead>
            <TableHead>Mobile Number</TableHead>
            <TableHead>Start Time</TableHead>
            <TableHead>End Time</TableHead>
            <TableHead>Amount</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {bookedChairs.map(chair => (
            <TableRow key={chair.id}>
              <TableCell>{chair.booked_date ? format(chair.booked_date, 'PP') : 'N/A'}</TableCell>
              <TableCell>{chair.customer_name}</TableCell>
              <TableCell>{chair.customer_mob}</TableCell>
              <TableCell>{chair.start_time}</TableCell>
              <TableCell>{chair.end_time}</TableCell>
              <TableCell>${chair.amount}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )

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

  const handleBooking = (e: React.FormEvent) => {
    e.preventDefault()
    // Implement booking functionality here
    console.log('Booking submitted')
  }

  return (
    <Layout>
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <header className="flex flex-wrap justify-center gap-4 mb-8">
        <Button 
          onClick={() => setCurrentView('booked')}
          variant={currentView === 'booked' ? 'default' : 'outline'}
        >
          Booked Chairs
        </Button>
        <Button 
          onClick={() => setCurrentView('available')}
          variant={currentView === 'available' ? 'default' : 'outline'}
        >
          Available Chairs
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
        {currentView === 'booked' && <BookedChairs />}
        {currentView === 'available' && <AvailableChairs />}
        {currentView === 'book' && <BookingForm />}
        {currentView === 'history' && <BookingHistory />}
      </main>
    </div>
    </Layout>
  )
}