import { render } from "@testing-library/react";
import { Avatar, AvatarBadge, AvatarFallback } from "./avatar";

describe("AvatarBadge", () => {
  it("renders the presence indicator outside the avatar boundary", () => {
    const { getByTestId } = render(
      <Avatar data-testid="avatar" size="sm">
        <AvatarFallback>PR</AvatarFallback>
        <AvatarBadge data-testid="presence" status="online" />
      </Avatar>
    );

    expect(getByTestId("avatar")).not.toHaveClass("overflow-hidden");
    expect(getByTestId("presence")).toHaveClass("-bottom-0.5", "-right-0.5");
  });
});
