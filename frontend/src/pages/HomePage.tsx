import React, { useState } from "react";
import { motion } from "framer-motion";
import Layout from "../components/Layout/Layout";
import HomeCard from "../components/Home/HomeCard";
import CardDetails from "../components/Home/CardDetails";

const HomePage: React.FC = () => {
  const cards = [
    {
      id: 1,
      title: "Delivery Orders",
      content: "Details of Delivery Orders",
      iconType: "Delivery" as const,
    },
    {
      id: 2,
      title: "Dining Orders",
      content: "Details of Dining Orders",
      iconType: "Dining" as const,
    },
    {
      id: 3,
      title: "Takeaway Orders",
      content: "Details of Takeaway Orders",
      iconType: "Takeaway" as const,
    },
  ];

  const [selectedCard, setSelectedCard] = useState(cards[0]);

  return (
    <Layout>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="grid grid-cols-12 gap-6 p-6 h-full bg-gray-100"
      >
        {/* Sidebar */}
        <motion.div
          className="col-span-12 md:col-span-3 lg:col-span-2 space-y-6 flex flex-col items-center bg-white p-4 rounded-lg shadow-lg"
          initial={{ x: -50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          {cards.map((card) => (
            <HomeCard
              key={card.id}
              card={card}
              onClick={() => setSelectedCard(card)}
              isActive={selectedCard?.id === card.id}
            />
          ))}
        </motion.div>

        {/* Card Details */}
        <motion.div
          className="col-span-12 md:col-span-9 lg:col-span-10 bg-white rounded-lg shadow-lg"
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.5 }}
        >
          <CardDetails selectedCard={selectedCard} />
        </motion.div>
      </motion.div>
    </Layout>
  );
};

export default HomePage;
