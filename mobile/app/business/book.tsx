import { Redirect, useLocalSearchParams } from "expo-router";

/** Legacy book route — forwards into where-to → plan (passenger-grade flow). */
export default function BusinessBookRedirect() {
  const params = useLocalSearchParams();
  return (
    <Redirect
      href={
        {
          pathname: "/business/where-to",
          params,
        } as never
      }
    />
  );
}
