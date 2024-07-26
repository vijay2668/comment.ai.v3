import { useRef } from "react";
import {
  ControlledMenu,
  MenuItem,
  useClick,
  useMenuState,
} from "@szhsin/react-menu";
import "@szhsin/react-menu/dist/index.css";
import "@szhsin/react-menu/dist/transitions/slide.css";
import "@szhsin/react-menu/dist/theme-dark.css";

export const MenuComp = ({
  children,
  options,
  data,
  isPending,
}) => {
  const ref = useRef(null);
  const [menuState, toggleMenu] = useMenuState({
    transition: true,
  });
  const anchorProps = useClick(menuState.state, toggleMenu);
  return (
    <>
      <button type="button" ref={ref} {...anchorProps}>
        {children}
      </button>
      <ControlledMenu
        {...menuState}
        anchorRef={ref}
        onClose={() => toggleMenu(false)}
        theming="dark"
      >
        {options?.map(({ label, onClick }, index) => (
          <MenuItem
            key={index}
            value={data}
            disabled={isPending}
            onClick={onClick}
          >
            {label}
          </MenuItem>
        ))}
      </ControlledMenu>
    </>
  );
};
