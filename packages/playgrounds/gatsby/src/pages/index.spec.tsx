import React from "react"
import { render } from "@testing-library/react"
import Index from "./index"
import { NinetailedProvider } from "@ninetailed/experience.js-gatsby"
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
global.fetch = jest.fn(() => Promise.resolve(""))
describe("Index", () => {
  it("should render successfully", () => {
    const { getByText } = render(
      <NinetailedProvider plugins={[]} clientId={""}>
        <Index />
      </NinetailedProvider>
    )
    expect(getByText(/Welcome test-gastby/i)).toBeTruthy()
  })
})
