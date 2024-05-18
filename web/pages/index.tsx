'use client'
import { useCallback, useEffect, useState } from "react";
import Chat from "@/components/Chat";
import MobileSiderbar from "@/components/MobileSidebar";
import Sidebar from "@/components/Sidebar";
import useAnalytics from "@/hooks/useAnalytics";
import Fingerprint from "@/components/FingerPrint";
import { useAppState } from "@/hooks/useAppStore";
import useBackendClient from "@/hooks/useBackendClient";
import AddRepo from "@/components/AddRepo";
import NoSSR from "@/shared/NoSSR";
import SignUp from "@/components/SignUp";
import SignIn from "@/components/SignIn";
import SubscriptionModal from "@/components/Subscription";


interface HomeProps {
  userId: string;
}

const Home: React.FC<HomeProps> = () => {
  const [isComponentVisible, setIsComponentVisible] = useState(false);
  const { trackEvent } = useAnalytics();
  const { authService, usersService } = useBackendClient();

  const {
    setIsLoggedIn,
    setShowSubscription,
    showSubscription,
    setShowSignUp,
    setShowSignIn,
    showSignIn,
    showSignUp,
    userInfo,
    userId,
    setUserInfo,
    setUserId,
    showAddRepo,
    setShowAddRepo } = useAppState();

  useEffect(() => {
    trackEvent("page.view", { page: "home" });
  }, [trackEvent]);

  const toggleComponentVisibility = () => {
    setIsComponentVisible(!isComponentVisible);
  };
  const reAuthenticate = useCallback(async () => {
    if (!!authService) {
      try {
        const result = await authService?.reAuthenticate();
        setIsLoggedIn(true)
        setUserInfo(result.user)
        setUserId(result.user.id)
      }
      catch (error) {
        setIsLoggedIn(false)
        setUserInfo(undefined)
        console.error('Re-authentication failed', error)
      }
    }
  }, [authService, setIsLoggedIn, setUserId, setUserInfo])

  useEffect(() => {
    reAuthenticate()
  }, [reAuthenticate])

  useEffect(() => {
    if (!!usersService) {
      usersService.on('patched', (userInfo) => {
        setUserInfo(userInfo)
      })
    }
  }, [setUserInfo, usersService])

  useEffect(() => {
    if (userInfo && userInfo.maxTries === 0 && !userInfo.isAdmin && userInfo.subscriptionStatus !== "active") {
      setShowSubscription(true);
    } else {
      setShowSubscription(false);
    }
  }, [setShowSubscription, userInfo, userInfo?.maxTries, userInfo?.isAdmin, userInfo?.subscriptionStatus])
  return (
    <>
      <Fingerprint />

      <NoSSR><AddRepo setOpenModal={setShowAddRepo} openModal={showAddRepo}></AddRepo></NoSSR>
      <NoSSR><SignUp setOpenModal={setShowSignUp} openModal={showSignUp}></SignUp></NoSSR>
      <NoSSR><SignIn setOpenModal={setShowSignIn} openModal={showSignIn}></SignIn></NoSSR>
      <NoSSR><SubscriptionModal setOpenModal={setShowSubscription} openModal={showSubscription}></SubscriptionModal></NoSSR>

      <main className="overflow-hidden w-full h-screen relative flex">
        {isComponentVisible ? (
          <MobileSiderbar toggleComponentVisibility={toggleComponentVisibility} />
        ) : null}
        <div className="dark hidden flex-shrink-0 bg-gray-800 md:flex md:w-[260px] md:flex-col">
          <div className="flex h-full min-h-0 flex-col ">
            <Sidebar />
          </div>
        </div>


        <Chat toggleComponentVisibility={toggleComponentVisibility} />
      </main>
    </>
  );
}


export default Home;
