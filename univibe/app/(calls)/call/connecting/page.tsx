import { getMainUserData } from "@/lib/getMainUserData"
import ConnectingClient from "@/components/call/ConnectingClient"

type SearchParams = {
    currentDomain: string
    filterByGender: string
    filterGenderData: string
    filterByCollege: string
    filterCollegeData: string
    filterByFieldOfStudy: string
    filterFieldOfStudyData: string
    filterByYear: string
    filterYearData: string
}

type Props = {
    searchParams: Promise<SearchParams>
}

export default async function ConnectingPage({ searchParams }: Props) {
    const { profile } = await getMainUserData()
    const params = await searchParams

    const filters = {
        filterByGender: params.filterByGender === "true",
        filterGenderData: params.filterGenderData ?? "",
        filterByCollege: params.filterByCollege === "true",
        filterCollegeData: params.filterCollegeData ?? "",
        filterByFieldOfStudy: params.filterByFieldOfStudy === "true",
        filterFieldOfStudyData: params.filterFieldOfStudyData ?? "",
        filterByYear: params.filterByYear === "true",
        filterYearData: params.filterYearData ?? "",
    }

    const currentDomain = parseInt(params.currentDomain ?? "3")

    return (
        <ConnectingClient
            profileId={profile.id}
            filters={filters}
            currentDomain={currentDomain}
        />
    )
}