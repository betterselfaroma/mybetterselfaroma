import AppInput from "./AppInput";

export default function AppTextarea(props: React.ComponentProps<typeof AppInput>) {
  return <AppInput multiline numberOfLines={4} textAlignVertical="top" {...props} style={[{ minHeight: 112, paddingTop: 14 }, props.style]} />;
}
