import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { loadBusinessMortgages, loadBusinessMortgageSchedule } from "../../../state/businessMortgagesSlice";

// What the property's mortgage schedules say is owed on date, or null when
// there's no mortgage, no date, or the schedules are still loading.
export default function useScheduledMortgageBalance(propertyId, date) {
  const dispatch = useDispatch();
  const allMortgages = useSelector((state) => state.businessMortgages.items);
  const schedules = useSelector((state) => state.businessMortgages.schedules);
  const mortgages = allMortgages.filter((mortgage) => mortgage.propertyId === propertyId);

  useEffect(() => {
    const loadSchedules = async () => {
      const loaded = await dispatch(loadBusinessMortgages()).unwrap();
      loaded
        .filter((mortgage) => mortgage.propertyId === propertyId)
        .forEach((mortgage) => dispatch(loadBusinessMortgageSchedule(mortgage.id)));
    };
    loadSchedules();
  }, [dispatch, propertyId]);

  if (!date || mortgages.length === 0 || !mortgages.every((mortgage) => schedules[mortgage.id])) {
    return null;
  }
  // Before the first payment due, the balance is the starting balance.
  return mortgages.reduce((total, mortgage) => {
    const paid = schedules[mortgage.id].filter((row) => row.dueDate <= date);
    return total + (paid.length > 0 ? paid[paid.length - 1].balanceCents : mortgage.originalPrincipalCents);
  }, 0);
}
