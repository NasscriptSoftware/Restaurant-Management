import { Link } from 'react-router-dom'
import { Card, CardContent } from "@/components/ui/card"
import { UtensilsCrossed, ClipboardList, Armchair, CalendarCheck } from 'lucide-react'
import Layout from '@/components/Layout/Layout'

export default function Dashboard() {
    const cards = [
        { name: "Customers", icon: ClipboardList, href: "/customer-details" },
        { name: "Dishes", icon: UtensilsCrossed, href: "/dishes" },
        { name: "Orders", icon: ClipboardList, href: "/orders" },
        { name: "Chairs", icon: Armchair, href: "/chairs" },
        { name: "Chair Booking", icon: CalendarCheck, href: "/chair-booking" },
    ]

    return (
        <Layout>
        <div className="container mx-auto p-4">
            {/* <h1 className="text-2xl font-bold mb-6">Restaurant Dashboard</h1> */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {cards.map(({ name, icon: Icon, href }) => (
                    <Link key={name} to={href} className="block" aria-label={`Go to ${name}`}>
                        <Card className="bg-purple-700 hover:shadow-lg transition-shadow cursor-pointer h-full">
                            <CardContent className="flex flex-col items-center justify-center p-6 h-full">
                                <Icon className="w-12 h-12 mb-4 text-white" />
                                <h2 className="text-xl font-semibold text-center text-white">{name}</h2>
                            </CardContent>
                        </Card>
                    </Link>
                ))}

            </div>
        </div>
        </Layout>
    )
}

