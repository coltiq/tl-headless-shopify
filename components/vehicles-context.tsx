"use client";

import type { VehicleGeneration } from "lib/fitment";
import { createContext, useContext, type ReactNode } from "react";

// The vehicle list is shared, cached, non-personal data that several client
// islands (garage picker, header search, category redirect) need synchronously,
// so — unlike the cart — the server awaits getVehicles() and passes the
// resolved array down rather than a promise. Defaults to [] so a component
// rendered outside the provider degrades to "no vehicles" instead of throwing.
const VehiclesContext = createContext<VehicleGeneration[]>([]);

export function VehiclesProvider({
  vehicles,
  children,
}: {
  vehicles: VehicleGeneration[];
  children: ReactNode;
}) {
  return (
    <VehiclesContext.Provider value={vehicles}>
      {children}
    </VehiclesContext.Provider>
  );
}

export function useVehicles(): VehicleGeneration[] {
  return useContext(VehiclesContext);
}
