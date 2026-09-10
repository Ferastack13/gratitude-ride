import { Redirect, useLocalSearchParams } from "expo-router";

/** Legacy book route — forwards into the map plan + confirm flow. */
export default function PassengerBookRedirect() {
  const params = useLocalSearchParams();
  return (
    <Redirect
      href={
        {
          pathname: "/passenger/plan",
          params,
        } as never
      }
    />
  );
}
