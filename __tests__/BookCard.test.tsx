import { fireEvent, render } from "@testing-library/react-native";
import React from "react";
import { BookCard } from "../components/BookCard";

const mockBook = {
  id: "1",
  title: "Test Book",
  author: "Test Author",
  cover: "https://example.com/cover.jpg",
};

describe("BookCard", () => {
  it("renders correctly with all props", () => {
    const onPress = jest.fn();
    const { getByText, getByLabelText } = render(
      <BookCard
        book={mockBook}
        onPress={onPress}
        accessibilityLabel="Test Label"
        accessibilityHint="Test Hint"
      />
    );

    expect(getByText("Test Book")).toBeTruthy();
    expect(getByText("Test Author")).toBeTruthy();
    expect(getByLabelText("Test Label")).toBeTruthy();
  });

  it("renders correctly without cover image", () => {
    const bookWithoutCover = { ...mockBook, cover: undefined };
    const { getByText } = render(
      <BookCard book={bookWithoutCover} onPress={() => {}} />
    );

    expect(getByText("Test Book")).toBeTruthy();
  });

  it("calls onPress when pressed", () => {
    const onPress = jest.fn();
    const { getByText } = render(<BookCard book={mockBook} onPress={onPress} />);

    fireEvent.press(getByText("Test Book"));
    expect(onPress).toHaveBeenCalled();
  });

  it("renders correctly without author", () => {
    const bookWithoutAuthor = { ...mockBook, author: undefined };
    const { queryByText } = render(
      <BookCard book={bookWithoutAuthor} onPress={() => {}} />
    );

    expect(queryByText("Test Author")).toBeNull();
  });
});
