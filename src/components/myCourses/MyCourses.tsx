import { Box, Tooltip, Typography } from "@mui/material";
import { ErrorOutline } from "@mui/icons-material";
import { useState, useEffect } from "react";
import useEntityApi from "../../utils/useEntityApi";
import findConflictsWithDetails from "../../utils/findConflicts";
import DeleteIcon from "@mui/icons-material/Delete";
import IconButton from "@mui/material/IconButton";
import { Course } from "../../types/types";
import { categories } from "../../types/categories";
import getMyUserId from "../../utils/userIdProvider";

const MyCourses = () => {
  // updateAsync'yi de ekledik çünkü enrolledUserIds güncellenecek
  const { listAsync, updateAsync } = useEntityApi("courses");
  const [courses, setCourses] = useState<Course[]>([]);
  const [conflictMap, setConflictMap] = useState<Record<number, string[]>>({});

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const res = await listAsync();
        const allCourses = res.data;
        const userId = getMyUserId();

        // Eğer userId null ise, işlemleri durduruyoruz.
        if (!userId) {
          console.error("Geçerli kullanıcı kimliği bulunamadı.");
          return;
        }

        // Kursları filtreleme: creatorUserId getMyUserId ile aynı değilse ve
        // enrolledUserIds dizisi userId değerini içeriyorsa
        const filteredCourses = allCourses.filter((course: Course) => {
          return (
            course.creatorUserId !== userId &&
            course.enrolledUserIds.includes(userId)
          );
        });

        setCourses(filteredCourses);
        setConflictMap(findConflictsWithDetails(filteredCourses));
      } catch (err) {
        console.error("Failed to fetch courses:", err);
      }
    };

    fetchCourses();
  }, [listAsync]);

  // Unenroll işlemi: İlgili course'nin enrolledUserIds'inden getMyUserId() değerini kaldırır.
  const handleUnenroll = async (course: Course) => {
    const userId = getMyUserId();

    if (!userId) {
      console.error("Kullanıcı kimliği bulunamadı.");
      return;
    }

    // enrolledUserIds içerisinden userId'yi çıkarıyoruz.
    const updatedEnrolled = course.enrolledUserIds.filter(
      (id) => id !== userId
    );
    const updatedCourse = { ...course, enrolledUserIds: updatedEnrolled };

    try {
      await updateAsync(course.id, updatedCourse);
      // Güncellemeden sonra kurs artık filtreye uymayacağından, listeden kaldırıyoruz.
      setCourses((prevCourses) => {
        const updated = prevCourses.filter((c) => c.id !== course.id);
        setConflictMap(findConflictsWithDetails(updated));
        return updated;
      });
    } catch (err) {
      console.error("Unenroll işlemi başarısız:", err);
    }
  };

  return (
    <Box
      sx={{
        p: 2,
        display: "flex",
        flexWrap: "wrap",
        gap: 2,
        justifyContent: "center",
      }}
    >
      {courses.length === 0 ? (
        <Box textAlign="center" mt={4}>
          <Typography variant="h6" fontWeight={500} color="text.secondary">
            Henüz hiç kursunuz bulunmuyor.
          </Typography>
          <Typography variant="body2" color="text.secondary" mt={1}>
            Courses sayfasından yeni kurslara kayıt olabilirsiniz.
          </Typography>
        </Box>
      ) : (
        courses.map((course, index) => {
          const conflictingCourses = conflictMap[index];

          return (
            <Box
              key={course.id}
              sx={{
                flex: "0 0 calc(25% - 16px)",
                maxWidth: "calc(25% - 16px)",
                bgcolor: "white",
                borderRadius: 2,
                boxShadow: 3,
                p: 2,
                display: "flex",
                flexDirection: "column",
                gap: 1,
                minWidth: "250px",
                position: "relative",
              }}
            >
              {/* Sağ alt köşedeki çöp simgesi: tıklandığında unenroll işlemi */}
              <IconButton
                onClick={() => handleUnenroll(course)}
                size="small"
                sx={{
                  position: "absolute",
                  bottom: 8,
                  right: 8,
                  color: "error.main",
                }}
              >
                <DeleteIcon fontSize="small" />
              </IconButton>

              {/* Çakışma ikonu */}
              {conflictingCourses && (
                <Tooltip
                  title={
                    <>
                      <Typography fontWeight={500} fontSize="0.9rem">
                        Time conflict with:
                      </Typography>
                      {conflictingCourses.map((name, i) => (
                        <Typography key={i} fontSize="0.8rem">
                          • {name}
                        </Typography>
                      ))}
                    </>
                  }
                  arrow
                >
                  <ErrorOutline
                    color="error"
                    sx={{
                      position: "absolute",
                      top: 8,
                      right: 8,
                      cursor: "pointer",
                    }}
                  />
                </Tooltip>
              )}

              {/* Kurs bilgileri */}
              <Typography variant="h6" fontWeight={600}>
                {course.title}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Category:{" "}
                {categories.find(
                  (category) => category.id === course.categoryId
                )?.name || "Bilinmiyor"}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Instructor: {course.instructor}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Time: {course.time.days} – {course.time.start} →{" "}
                {course.time.end}
              </Typography>
            </Box>
          );
        })
      )}
    </Box>
  );
};

export default MyCourses;
