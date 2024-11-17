import "./App.css";
import { useEffect, useState, useCallback } from "react";
import List from "./components/List/List";
import Navbar from "./components/Navbar/Navbar";
import axios from "axios";
function App() {
  const statusList = ["In progress", "Backlog", "Todo", "Done", "Cancelled"];
  const userList = [
    "Anoop sharma",
    "Yogesh",
    "Shankar Kumar",
    "Ramesh",
    "Suresh",
  ];
  const priorityList = [
    { name: "No priority", priority: 0 },
    { name: "Low", priority: 1 },
    { name: "Medium", priority: 2 },
    { name: "High", priority: 3 },
    { name: "Urgent", priority: 4 },
  ];

  const [ticketDetails, setticketDetails] = useState([]);
  const [groupValue, setgroupValue] = useState(
    getStateFromLocalStorage() || "status"
  );
  const [orderValue, setorderValue] = useState("title");

  const orderDataByValue = useCallback(
    async (cardsArry) => {
      if (orderValue === "priority") {
        cardsArry.sort((a, b) => b.priority - a.priority);
      } else if (orderValue === "title") {
        cardsArry.sort((a, b) => {
          const titleA = a.title.toLowerCase();
          const titleB = b.title.toLowerCase();

          if (titleA < titleB) {
            return -1;
          } else if (titleA > titleB) {
            return 1;
          } else {
            return 0;
          }
        });
      }
      await setticketDetails(cardsArry);
    },
    [orderValue]
  );

  function saveStateToLocalStorage(state) {
    localStorage.setItem("groupValue", JSON.stringify(state));
  }

  function getStateFromLocalStorage() {
    const storedState = localStorage.getItem("groupValue");
    if (storedState) {
      return JSON.parse(storedState);
    }
    return null;
  }

  useEffect(() => {
    saveStateToLocalStorage(groupValue);
    async function fetchData() {
      const response = await axios.get(
        "https://api.quicksell.co/v1/internal/frontend-assignment"
      );

      await refactorData(response);
    }
    fetchData();
    async function refactorData(response) {
      let ticketArray = [];
      if (response.status === 200) {
        for (let i = 0; i < response.data.tickets.length; i++) {
          for (let j = 0; j < response.data.users.length; j++) {
            if (response.data.tickets[i].userId === response.data.users[j].id) {
              let ticketJson = {
                ...response.data.tickets[i],
                userObj: response.data.users[j],
              };
              ticketArray.push(ticketJson);
            }
          }
        }
      }
      await setticketDetails(ticketArray);
      console.log(ticketArray);
      orderDataByValue(ticketArray);
    }
  }, [orderDataByValue, groupValue]);

  function handleGroupValue(value) {
    setgroupValue(value);
    console.log(value);
  }

  function handleOrderValue(value) {
    setorderValue(value);
    console.log(value);
  }

  return (
    <div className="App">
      <Navbar
        groupValue={groupValue}
        orderValue={orderValue}
        handleGroupValue={handleGroupValue}
        handleOrderValue={handleOrderValue}
      />
      <section className="board-details">
        <div className="board-details-list">
          {
            {
              status: (
                <>
                  {statusList.map((listItem) => {
                    return (
                      <List
                        groupValue="status"
                        orderValue={orderValue}
                        listTitle={listItem}
                        listIcon=""
                        statusList={statusList}
                        ticketDetails={ticketDetails}
                      />
                    );
                  })}
                </>
              ),
              user: (
                <>
                  {userList.map((listItem) => {
                    return (
                      <List
                        groupValue="user"
                        orderValue={orderValue}
                        listTitle={listItem}
                        listIcon=""
                        userList={userList}
                        ticketDetails={ticketDetails}
                      />
                    );
                  })}
                </>
              ),
              priority: (
                <>
                  {priorityList.map((listItem) => {
                    return (
                      <List
                        groupValue="priority"
                        orderValue={orderValue}
                        listTitle={listItem.priority}
                        listIcon=""
                        priorityList={priorityList}
                        ticketDetails={ticketDetails}
                      />
                    );
                  })}
                </>
              ),
            }[groupValue]
          }
        </div>
      </section>
    </div>
  );
}

export default App;