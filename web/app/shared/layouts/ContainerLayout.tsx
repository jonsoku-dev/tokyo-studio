import { Outlet } from "react-router";
import { Container } from "~/shared/components/ui/Container";

export default function ContainerLayout() {
	return (
		<Container variant="page" className="py-responsive">
			<Outlet />
		</Container>
	);
}
