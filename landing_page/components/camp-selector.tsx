"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, MapPin, Users } from "lucide-react"

const camps = [
  { id: 1, name: "Camp Ramah", location: "Ojai, CA", type: "Overnight", members: 47 },
  { id: 2, name: "Camp Tawonga", location: "Groveland, CA", type: "Overnight", members: 32 },
  { id: 3, name: "Camp Newman", location: "Santa Rosa, CA", type: "Overnight", members: 28 },
  { id: 4, name: "Camp Alonim", location: "Simi Valley, CA", type: "Overnight", members: 19 },
  { id: 5, name: "Camp JCA Shalom", location: "Malibu, CA", type: "Overnight", members: 15 },
  { id: 6, name: "Camp Hess Kramer", location: "Malibu, CA", type: "Overnight", members: 22 },
]

const CampSelector = () => {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCamp, setSelectedCamp] = useState<number | null>(null)

  const filteredCamps = camps.filter(
    (camp) =>
      camp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      camp.location.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  return (
    <div className="bg-white rounded-xl shadow-lg border border-[#4F9F86]/10 overflow-hidden">
      <div className="p-4 border-b border-gray-100">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          <Input
            placeholder="Search camps by name or location..."
            className="pl-10 border-[#4F9F86]/20 focus-visible:ring-[#4F9F86]"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="h-[400px] overflow-y-auto p-2">
        {filteredCamps.length > 0 ? (
          <div className="grid grid-cols-1 gap-2">
            {filteredCamps.map((camp) => (
              <motion.div
                key={camp.id}
                className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                  selectedCamp === camp.id ? "bg-[#4F9F86]/10 border-[#4F9F86]" : "border-gray-200 hover:bg-gray-50"
                }`}
                onClick={() => setSelectedCamp(camp.id)}
                whileHover={{ scale: 1.01 }}
                transition={{ type: "spring", stiffness: 400, damping: 10 }}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-medium">{camp.name}</h3>
                    <div className="flex items-center text-sm text-gray-500 mt-1">
                      <MapPin size={14} className="mr-1" />
                      <span>{camp.location}</span>
                    </div>
                  </div>
                  <div className="bg-[#4F9F86]/10 px-2 py-1 rounded text-xs text-[#4F9F86] font-medium">
                    {camp.type}
                  </div>
                </div>
                <div className="flex items-center mt-2 text-sm text-gray-600">
                  <Users size={14} className="mr-1" />
                  <span>{camp.members} alumni connected</span>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center p-4">
            <div className="text-gray-400 mb-2">
              <Search size={40} />
            </div>
            <h3 className="text-lg font-medium text-gray-700">No camps found</h3>
            <p className="text-gray-500 mt-1">Try a different search term or add your camp</p>
            <Button className="mt-4 bg-[#4F9F86] hover:bg-[#4F9F86]/90 text-white">Add Your Camp</Button>
          </div>
        )}
      </div>

      <div className="p-4 border-t border-gray-100 bg-gray-50">
        <Button className="w-full bg-[#4F9F86] hover:bg-[#4F9F86]/90 text-white" disabled={selectedCamp === null}>
          Continue with Selected Camp
        </Button>
      </div>
    </div>
  )
}

export default CampSelector
