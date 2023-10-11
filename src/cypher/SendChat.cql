MATCH (r:Room {name: $room})
MATCH (u:User {username: $username})
CREATE (r)-[r1:CONTAINS]->(m:Chat {message: $message, created: datetime()})-[r2:SENT_BY]->(u);