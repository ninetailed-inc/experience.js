import React from "react"

type HeroProps = {
  headline: string | JSX.Element
}

export const Hero: React.FC<HeroProps> = ({ headline }) => {
  return <div>{headline}</div>
}
