import { useState } from 'react';
import { useQuery } from 'react-query';
import { getDishes } from '../services/api';
import { UseDishesReturn } from '../types';

export const useDishes = (): UseDishesReturn => {
  const [page, setPage] = useState(1);

  const { data, isLoading, isError, refetch } = useQuery(['dishes'], () => getDishes(), {
    keepPreviousData: true,
  });

  const addDishToOrder = () => null;

  return {
    dishes: data,
    isLoading,
    isError,
    refetch,
    addDishToOrder,
    page,
    setPage,
  };
};
