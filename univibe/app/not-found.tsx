import Link from "next/link"
import Image from "next/image"
import Bgm404 from "../components/ui/Bgm404"

export default function NotFound() {
    return (
        <div className="h-screen w-screen flex justify-center items-center text-center">
            <div className="flex flex-col items-center gap-5">
                <Image
                    src="/scuba-cat-404.gif"
                    alt="404 scuba cat"
                    width={200}
                    height={200}
                />
                <p className="font-bold text-5xl">
                    404
                </p>

                <div className="text-xs font-semibold text-muted-foreground">
                    <p>
                        Our site only has 4 pages.
                    </p>
                    <p>
                        How the f*ck did you end up here?
                    </p>
                </div>

                <div className="flex gap-5">
                    <Link href="/" className="btn text-sm font-bold">
                        Back To Home!
                    </Link>
                    <Bgm404 />
                </div>
            </div>
        </div>
    )
}