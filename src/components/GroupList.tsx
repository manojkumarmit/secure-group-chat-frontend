import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';

interface User {
    id: string;
    name: string;
    email: string;
}

interface Group {
    _id: string;
    name: string;
    creator: string;
    members: User[];
    id: string;
}

/**
 * GroupList component for displaying and managing user groups.
 * 
 * Props:
 * - user: The current user object.
 * - token: The authentication token for API requests.
 * - onEnterGroup: Callback function to handle entering a group.
 * 
 * State:
 * - myGroups: Array of group objects representing the groups the user is a member of.
 * - allGroups: Array of group objects representing all available groups.
 * - newGroupName: String representing the name of the new group to be created.
 * - selectedTab: String representing the currently selected tab ("my" or "other").
 * 
 * Functions:
 * - fetchGroups: Fetches the user's groups and all available groups from the API.
 * - createGroup: Creates a new group with the specified name and adds the current user as the creator.
 * - joinGroup: Adds the current user to the specified group.
 * - leaveGroup: Removes the current user from the specified group.
 * - deleteGroup: Deletes the specified group.
 * - transferOwnership: Transfers ownership of the specified group to a new owner.
 * 
 * Effects:
 * - useEffect to fetch groups when the component mounts.
 */
const GroupList = ({ user, token, onEnterGroup }: {
    user: User;
    token: string;
    onEnterGroup: (group: Group) => void;
}) => {
    const { logout } = useAuth();
    const [myGroups, setMyGroups] = useState<Group[]>([]);
    const [allGroups, setAllGroups] = useState<Group[]>([]);
    const [newGroupName, setNewGroupName] = useState("");
    const [selectedTab, setSelectedTab] = useState<"my" | "other">("my");
    const authHeader = { Authorization: `Bearer ${token}` };

    useEffect(() => {
        fetchGroups();
    }, []);

    const fetchGroups = async () => {
        const my = await fetch("/api/groups/my", { headers: authHeader }).then(res => res.json());
        const all = await fetch("/api/groups", { headers: authHeader }).then(res => res.json());
        setMyGroups(my);
        setAllGroups(all);
    };

    const createGroup = async () => {
        await fetch("/api/groups", {
            method: "POST",
            headers: { "Content-Type": "application/json", ...authHeader },
            body: JSON.stringify({ name: newGroupName, creatorId: user.id }),
        });
        setNewGroupName("");
        fetchGroups();
    };

    const joinGroup = async (groupId: string) => {
        await fetch(`/api/groups/${groupId}/join`, { method: "POST", headers: authHeader });
        fetchGroups();
    };

    const leaveGroup = async (groupId: string) => {
        await fetch(`/api/groups/${groupId}/leave`, { method: "POST", headers: authHeader });
        fetchGroups();
    };

    const deleteGroup = async (groupId: string) => {
        await fetch(`/api/groups/${groupId}`, { method: "DELETE", headers: authHeader });
        fetchGroups();
    };

    const transferOwnership = async (groupId: string, newOwnerId: string) => {
        await fetch(`/api/groups/${groupId}/transfer`, {
            method: "POST",
            headers: { "Content-Type": "application/json", ...authHeader },
            body: JSON.stringify({ newOwnerId }),
        });
        fetchGroups();
    };

    const otherGroups = allGroups.filter(
        g => !myGroups.some(mg => mg._id === g._id)
    );

    const handleEnterGroup = (group: Group) => {
        onEnterGroup(group);
    };

    return (
        <div className="min-h-screen bg-gray-100">
            <div className="flex items-center justify-between p-4 bg-white border-b">
                <h1 className="text-2xl font-bold text-gray-800">Groups</h1>
                <button
                    onClick={logout}
                    className="text-red-600 hover:text-red-800 px-4 py-2 rounded-lg hover:bg-red-50"
                >
                    Logout
                </button>
            </div>
            <div className="p-4">
                <h2 className="text-xl font-bold mb-2">Create Group</h2>
                <div className="flex mb-4">
                    <input
                        type="text"
                        placeholder="Group name"
                        value={newGroupName}
                        onChange={(e) => setNewGroupName(e.target.value)}
                        className="border px-3 py-2 mr-2 rounded"
                    />
                    <button
                        onClick={createGroup}
                        className="bg-blue-600 text-white px-4 py-2 rounded"
                    >
                        Create
                    </button>
                </div>

                <div className="flex space-x-4 mb-4">
                    <button
                        onClick={() => setSelectedTab("my")}
                        className={`px-4 py-2 rounded ${selectedTab === "my" ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-700"}`}
                    >
                        My Groups
                    </button>
                    <button
                        onClick={() => setSelectedTab("other")}
                        className={`px-4 py-2 rounded ${selectedTab === "other" ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-700"}`}
                    >
                        Other Groups
                    </button>
                </div>

                {selectedTab === "my" && (
                    <div>
                        <h2 className="text-lg font-semibold mb-2">My Groups</h2>
                        {myGroups.map((g) => (
                            <div key={g._id} className="flex justify-between items-center mb-2 p-2 border rounded">
                                <div>{g.name}</div>
                                <div className="space-x-2">
                                    {g.creator === user.id ? (
                                        <>
                                            <button
                                                onClick={() => deleteGroup(g._id)}
                                                className="text-red-500 hover:underline"
                                            >
                                                Delete
                                            </button>
                                            <button
                                                onClick={() => {
                                                    const newOwnerId = prompt("Enter new owner ID:");
                                                    if (newOwnerId) transferOwnership(g._id, newOwnerId);
                                                }}
                                                className="text-blue-500 hover:underline"
                                            >
                                                Transfer Ownership
                                            </button>
                                        </>
                                    ) : (
                                        <button
                                            onClick={() => leaveGroup(g._id)}
                                            className="text-yellow-600 hover:underline"
                                        >
                                            Leave
                                        </button>
                                    )}
                                    <button onClick={() => handleEnterGroup(g)} className="text-blue-500 hover:underline">
                                        Enter Chat
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {selectedTab === "other" && (
                    <div>
                        <h2 className="text-lg font-semibold mb-2">Other Groups</h2>
                        {otherGroups.map((g) => (
                            <div key={g._id} className="flex justify-between items-center mb-2 p-2 border rounded">
                                <div>{g.name}</div>
                                <button
                                    onClick={() => joinGroup(g._id)}
                                    className="text-green-600 hover:underline"
                                >
                                    Join
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default GroupList;