import React, { useState, useEffect, useRef } from "react";
import styled from "styled-components";
import throttle from "lodash/throttle";
import Overlay from "../../components/Overlay/Overlay";
import Flex from "../../components/Box/Flex";
import { useMatchBreakpoints } from "../../hooks";
import Logo from "./components/Logo";
import Panel from "./components/Panel";
import UserBlock from "./components/UserBlock";
import { NavProps } from "./types";
import Avatar from "./components/Avatar";
import { MENU_HEIGHT, SIDEBAR_WIDTH_REDUCED, SIDEBAR_WIDTH_FULL } from "./config";

const Wrapper = styled.div`
  position: relative;
  width: 100%;
`;

const StyledNav = styled.nav<{ showMenu: boolean }>`
  transition: top 0.2s;
  display: flex;
  position: relative;
  justify-content: space-between;
  padding-left: 20px;
  padding-top: 15px;
  width: 100%;
  background-color: transparent;
  z-index: 20;
  transform: translate3d(0, 0, 0);

  & div:nth-child(2) {
    position: relative;
  }

  ${({ theme }) => theme.mediaQueries.sm} {
    justify-content: center;
    padding-left: 0;
    
    & div:nth-child(2) {
      position: fixed;
      right: 15px;
      top: 15px;
    }

  }
`;

const BodyWrapper = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;
  background-image: url(/images/main-bg.jpg);
  background-repeat: no-repeat;
  background-size: cover;
`;

const Inner = styled.div<{ isPushed: boolean; showMenu: boolean; hideSidebar: boolean; }>`
  flex-grow: 1;
  transition: margin-top 0.2s, margin-left 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  transform: translate3d(0, 0, 0);
  max-width: 100%;
`;

const MobileOnlyOverlay = styled(Overlay)`
  position: fixed;
  height: 100%;

  ${({ theme }) => theme.mediaQueries.nav} {
    display: none;
  }
`;

const Menu: React.FC<NavProps> = ({
  account,
  hideSidebar,
  login,
  logout,
  isDark,
  toggleTheme,
  langs,
  setLang,
  currentLang,
  cakePriceUsd,
  links,
  profile,
  children,
}) => {
  const { isXl } = useMatchBreakpoints();
  const isMobile = isXl === false;
  const [isPushed, setIsPushed] = useState(!isMobile);
  const [showMenu, setShowMenu] = useState(true);
  const refPrevOffset = useRef(window.pageYOffset);

  useEffect(() => {
    const handleScroll = () => {
      const currentOffset = window.pageYOffset;
      const isBottomOfPage = window.document.body.clientHeight === currentOffset + window.innerHeight;
      const isTopOfPage = currentOffset === 0;
      // Always show the menu when user reach the top
      if (isTopOfPage) {
        setShowMenu(true);
      }
      // Avoid triggering anything at the bottom because of layout shift
      else if (!isBottomOfPage) {
        if (currentOffset < refPrevOffset.current) {
          // Has scroll up
          setShowMenu(true);
        } else {
          // Has scroll down
          setShowMenu(false);
        }
      }
      refPrevOffset.current = currentOffset;
    };
    const throttledHandleScroll = throttle(handleScroll, 200);

    window.addEventListener("scroll", throttledHandleScroll);
    return () => {
      window.removeEventListener("scroll", throttledHandleScroll);
    };
  }, []);

  // Find the home link if provided
  const homeLink = links.find((link) => link.label === "Home");

  return (
    <Wrapper>
      <BodyWrapper>
        <StyledNav showMenu={showMenu}>
          <Logo
            isPushed={isPushed}
            hideSidebar={hideSidebar}
            togglePush={() => setIsPushed((prevState: boolean) => !prevState)}
            isDark={isDark}
            href={homeLink?.href ?? "/"}
          />
          <Flex style={{  }}>
            <UserBlock account={account} login={login} logout={logout} />
          </Flex>
        </StyledNav>
        <Inner isPushed={isPushed} showMenu={showMenu} hideSidebar={hideSidebar || false}>
          {children}
        </Inner>
        <MobileOnlyOverlay show={isPushed} onClick={() => setIsPushed(false)} role="presentation" />
      </BodyWrapper>
    </Wrapper>
  );
};

export default Menu;
