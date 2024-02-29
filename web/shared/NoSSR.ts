import dynamic from "next/dynamic";

type NoSSRProps = { children: JSX.Element };
const NoSSR = (props: NoSSRProps) => {
  const { children } = props;

  return children;
};

export default dynamic(() => Promise.resolve(NoSSR), {
  ssr: false,
});
